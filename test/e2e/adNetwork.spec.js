describe("Ad Network Test", function () {

    var tagcadeTestUtil = require('./util/tagcade.test.util');

    beforeEach(function () {
    });

    afterEach(function () {
        if (this.results_.failedCount > 0) {
            browser.quit();
        }
    });

    it('should list Ad Network', function () {
        browser.get(browser.params.role + '/tagManagement/adNetworks/list');

        expect(browser.getTitle()).
            toEqual('Ad Networks | Tagcade Platform');
    });

    it('should create AdNetwork failed by url invalid', function () {
        browser.get(browser.params.role + '/tagManagement/adNetworks/new');

        var name = element(by.model('adNetwork.name'));
        var url = element(by.model('adNetwork.url'));

        selectPublisher(0);
        name.sendKeys('adnetwork-test' + tagcadeTestUtil.getDateString(new Date()));
        url.sendKeys('adnetwork.test@invalid***');

        element(by.css('.btn.btn-success')).click();

        expect(element(by.binding('message')).getText()).
            toEqual('This value is not a valid URL.');
    });

    it('should create AdNetwork successfully', function () {
        browser.get(browser.params.role + '/tagManagement/adNetworks/new');

        var name = element(by.model('adNetwork.name'));
        var url = element(by.model('adNetwork.url'));

        selectPublisher(0);
        name.sendKeys('adnetwork-test' + tagcadeTestUtil.getDateString(new Date()));
        url.sendKeys('adnetwork.test');

        element(by.css('.btn.btn-success')).click();

        expect(element(by.binding('message')).getText()).
            toEqual('The ad network has been created');
    });

    it('should update AdNetwork failed by url invalid', function () {
        browser.get(browser.params.role + '/tagManagement/adNetworks/edit/' + browser.params.edit.adNetworkId);

        var name = element(by.model('adNetwork.name'));
        var url = element(by.model('adNetwork.url'));

        name.clear();
        url.clear();

        name.sendKeys('adnetwork-test' + tagcadeTestUtil.getDateString(new Date()));
        url.sendKeys('adnetwork.test@invalid***');

        element(by.css('.btn.btn-success')).click();

        expect(element(by.binding('message')).getText()).
            toEqual('This value is not a valid URL.');
    });

    it('should update AdNetwork successfully', function () {
        browser.get(browser.params.role + '/tagManagement/adNetworks/edit/' + browser.params.edit.adNetworkId);

        var name = element(by.model('adNetwork.name'));
        var url = element(by.model('adNetwork.url'));

        name.clear();
        url.clear();

        name.sendKeys('adnetwork-test' + tagcadeTestUtil.getDateString(new Date()));
        url.sendKeys('adnetwork.test');

        element(by.css('.btn.btn-success')).click();

        expect(element(by.binding('message')).getText()).
            toEqual('The ad network has been updated');
    });

    function selectPublisher(rowId) {
        tagcadeTestUtil.selectItemByModel('adNetwork.publisher', '.ui-select-choices-row-inner', rowId);
    }
});