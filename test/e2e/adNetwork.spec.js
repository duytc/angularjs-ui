describe("Ad Network Test", function() {
    it('Ad Network list', function() {

        browser.get(browser.params.role + '/tagManagement/adNetworks/list');

        expect(browser.getTitle()).
            toEqual('Ad Networks | Tagcade Platform');
    });

    it('Ad Network update', function() {

        browser.get(browser.params.role + '/tagManagement/adNetworks/edit/' + browser.params.edit.adNetworkId);

        var name = element(by.model('adNetwork.name'));
        var defaultCpmRate = element(by.model('adNetwork.defaultCpmRate'));
        var url = element(by.model('adNetwork.url'));

        name.clear();
        defaultCpmRate.clear();
        url.clear();

        name.sendKeys('adnetwork-test');
        defaultCpmRate.sendKeys('10');
        url.sendKeys('adnetwork.test');

        element(by.css('.btn.btn-success')).click();

        expect(element(by.binding('message')).getText()).
            toEqual('The ad network has been updated');
    });
});