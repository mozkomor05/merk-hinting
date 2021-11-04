Espo.define('merk-hinting:views/lead/detail', ['crm:views/lead/detail', 'lib!TypeAhead', 'lib!MerkHinting'], function (Dep, TypeAhead, MerkHinting) {

    return Dep.extend({

        afterRender: function () {
            Dep.prototype.afterRender.call(this);

            //const $companyName = this.$el.find('[data-name="accountName"]');

            // $companyName.merkSuggestify({
            //     suggestBy: 'name',
            //     proxyUrl: this.merkProxyUrl,
            //     mapping: {
            //         "name": "accountName",
            //     },
            //     wrapper: this.$el
            // });
        }
    });
});


