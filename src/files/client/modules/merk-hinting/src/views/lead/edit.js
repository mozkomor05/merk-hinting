Espo.define('merk-hinting:views/lead/edit', ['views/edit', 'lib!TypeAhead', 'lib!MerkHinting'], function (Dep, TypeAhead, MerkHinting) {

    return Dep.extend({

        merkProxyUrl: "MerkAPI",

        afterRender: function () {
            Dep.prototype.afterRender.call(this);
            //return;

            const $companyName = this.$el.find('input[data-name="accountName"]');

            $companyName.merkSuggestify({
                suggestBy: 'name',
                proxyUrl: this.merkProxyUrl,
                mapping: {
                    "name": ".form-control[data-name='accountName']",
                    "address": {
                        "municipality": ".form-control[data-name='addressCity']",
                        "postal_code": ".form-control[data-name='addressPostalCode']",
                        "country_code": ".form-control[data-name='addressCountry']",
                        "region": {
                            "text": ".form-control[data-name='addressState']"
                        },
                        "lines": {
                            0: ".form-control[data-name='addressStreet']"
                        }
                    },
                    "emails": {
                        0: {"email": "[data-name='emailAddress'] input"}
                    },
                    "phones|mobiles": {
                        0: {"number": "[data-name='phoneNumber'] input"}
                    },
                    "webs": {
                        0: {"url": ".form-control[data-name='website']"}
                    },
                    "industry": {
                        "text": ".form-control[data-name='description']"
                    },
                    "turnover": {
                        "text": ".form-control[data-name='turnoverDetail']"
                    },
                    "magnitude": {
                        "text": ".form-control[data-name='employees']"
                    }
                },
                wrapper: this.$el,
                requestDelay: 3000,
                clearOnSelect: true,
            });
        }
    });
});


