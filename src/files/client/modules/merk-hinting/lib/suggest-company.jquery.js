/*!
 * WPDistro's fork of merkSuggestify jQuery Plugin
 * Original: https://github.com/impercz/merk-suggest-company-js
 *
 *
 * Usage:
 *  $('input').merkSuggestify(options);
 *
 * options: @object
 *  {
 *     suggestBy:    @string
 *                   choose one of the following values: 'name', 'regno', 'email'
 *                   default: 'name'
 *
 *     proxyUrl:     @string - REQUIRED
 *                   URL of server-side script which provides Merk API Suggest results
 *
 *     mapping:      @object - REQUIRED
 *                   {key1: value1, key2: value2, ...}
 *                   where key is an API attribute, value is `name` attribute of the target <input>
 *
 *     onlyActive   @boolean
 *                   excludes inactive companies from suggestion results
 *                   default: false
 *
 *     sortBy       @string
 *                   choose one of the following values: 'fulltext_score', 'name', 'turnover', 'turnover_name'
 *                   default: 'fulltext_score'
 *
 *     requestDelay: @integer
 *                   suggestion refresh rate in miliseconds
 *                   default: 300
 *
 *     template:     @function(obj)
 *                   param `obj` contains result object of suggested item
 *                   returns snippet that represents one item in suggest results
 *                   example: function(obj) { return obj.name + ' - ' + obj.regno }
 *                   default template is provided
 *  }
 */

(function ($, window, document, undefined) {
    "use strict";

    var pluginName = "merkSuggestify",
        defaults = {
            suggestBy: "name", // name | regno | email
            proxyUrl: "",
            mapping: {},
            requestDelay: 300,
            template: undefined,
            wrapper: undefined,
        };

    function Plugin(element, options) {
        this.$element = $(element);
        this.options = $.extend({}, defaults, options);
        this.$wrapper = this.options.wrapper;
        // noinspection JSUnusedGlobalSymbols
        this.intLoader = null;

        this.init();
    }

    Plugin.prototype = {
        init: function () {
            var plugin = this;

            this.$element.typeahead(null, {
                name: "companies_result",

                display: function (obj) {
                    if (plugin.options.suggestBy === "email") {
                        return obj["emails"][0]["email"];
                    }

                    return obj[plugin.options.suggestBy];
                },

                source: function (query, syncResults, asyncResults) {
                    query = query.trim();
                    if (query.length < 2) return;
                    clearInterval(plugin.intLoader);
                    plugin.$element.addClass("loading");
                    var url = plugin.options.proxyUrl + "?" + encodeURIComponent(plugin.options.suggestBy) + "=" + encodeURIComponent(query);

                    if (plugin.options.hasOwnProperty("onlyActive")) {
                        url += "&only_active=" + Boolean(plugin.options.onlyActive);
                    }
                    if (plugin.options.hasOwnProperty("sortBy")) {
                        url += "&sort_by=" + plugin.options.sortBy;
                    }
                    $.get(url, function (data) {
                        if (typeof data !== "undefined") {
                            asyncResults(data);
                        }
                    })
                        .fail(function (e) {
                            if (e.status > 400) {
                                var errors = {
                                    401: "Not authorized",
                                    403: "Expired account, or assigned API calls limit exhausted",
                                };

                                alert(errors[e.status] || "Unknown error occured");
                            }
                        })
                        .always(function () {
                            clearInterval(plugin.intLoader);
                            plugin.intLoader = setInterval(function () {
                                plugin.$element.removeClass("loading");
                            }, 1000);
                        });
                },

                templates: {
                    suggestion: function (obj) {
                        var ret;
                        if (typeof plugin.options.template !== "undefined") ret = plugin.options.template(obj);
                        else ret = plugin.template(obj);

                        return "<div>" + ret + "</div>";
                    },
                },
            });

            this.$element.bind("typeahead:select", function (event, object) {
                if (plugin.options.clearOnSelect) {
                    plugin.clear_fields();
                }

                plugin.update_fields(object);
            });
        },

        template: function (obj) {
            var hasStreet, hasMunicipality, ret;

            ret = "<strong>" + obj.name + "</strong> - " + obj.regno;

            if (obj.hasOwnProperty("address")) {
                hasStreet = obj.address.hasOwnProperty("street");
                hasMunicipality = obj.address.hasOwnProperty("municipality");

                if (hasStreet || hasMunicipality) {
                    ret += "<address>";

                    if (hasStreet) {
                        ret += obj.address.street;

                        if (obj.address.hasOwnProperty("number")) ret += " " + obj.address.number;
                        if (hasMunicipality) ret += ", ";
                    }

                    if (hasMunicipality) {
                        ret += obj.address.municipality;
                    }
                    ret += "</address>";
                }
            }

            return ret;
        },

        clear_fields: function (mapping) {
            if (typeof mapping === "undefined")
                mapping = this.options.mapping;

            for (const val of Object.values(mapping)) {
                if (typeof val === "object") {
                    this.clear_fields(val);
                    continue;
                }

                $(val).val("");
            }
        },

        update_fields: function (object, mapping) {
            if (typeof mapping === "undefined")
                mapping = this.options.mapping;

            for (let api_field in mapping) {
                if (!mapping.hasOwnProperty(api_field)) {
                    continue;
                }

                const api_fields = api_field.split('|');

                for (const field of api_fields) {
                    if (typeof mapping[api_field] === "object" && Object.keys(mapping[api_field]).length) {
                        if (!object.hasOwnProperty(field)) {
                            object[field] = "";
                        }

                        this.update_fields(object[field], mapping[api_field]);
                        continue;
                    }

                    const value = object.hasOwnProperty(field) ? object[field] : "";

                    if (value) {
                        $(mapping[api_field], this.$wrapper).val(value);
                    }
                }
            }
        },
    };

    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin(this, options));
            }
        });
    };
})(jQuery, window, document);