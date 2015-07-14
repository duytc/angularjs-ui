describe("Display Ad Slots Test", function() {

    var tagcadeTestUtil = require('./util/tagcade.test.util');

    var name = element(by.model('adSlot.name'));
    var width = element(by.model('adSlot.width'));
    var height = element(by.model('adSlot.height'));

    beforeEach(function () {
    });

    afterEach(function () {
        if (this.results_.failedCount > 0) {
            browser.quit();
        }
    });

    it('should create Display Ad Slots successfully', function() {
        browser.get(browser.params.role + '/tagManagement/adSlots/new');

        selectAdSlotTypeDisplay();

        selectPublisher(0);

        selectSite(0);

        name.sendKeys('displayAdSlot-test' + tagcadeTestUtil.getDateString(new Date()));
        width.sendKeys('100');
        height.sendKeys('200');

        element(by.css('.btn.btn-success')).click();

        expect(element(by.binding('message')).getText()).
            toEqual('The ad slot has been created');
    });

    it('should create Display Ad Slots failed by width/height', function() {
        browser.get(browser.params.role + '/tagManagement/adSlots/new');

        selectAdSlotTypeDisplay();

        selectPublisher(0);

        selectSite(0);

        name.sendKeys('displayAdSlot-test' + tagcadeTestUtil.getDateString(new Date()));
        width.sendKeys('100000000000000000000000000000000000000000000000000000000000');
        height.sendKeys('100000000000000000000000000000000000000000000000000000000000');

        element(by.css('.btn.btn-success')).click();

        expect(element(by.binding('message')).getText()).
            toEqual('An error occurred. The ad slot could not be created');
    });

    it('should update Display Ad Slots successfully', function() {
        browser.get(browser.params.role + '/tagManagement/adSlots/edit/' + browser.params.edit.adSlotId);

        name.clear();
        width.clear();
        height.clear();

        name.sendKeys('displayAdSlot-test' + tagcadeTestUtil.getDateString(new Date()));
        width.sendKeys('100');
        height.sendKeys('200');

        element(by.css('.btn.btn-success')).click();

        expect(element(by.binding('message')).getText()).
            toEqual('The ad slot has been updated');
    });

    it('should update Display Ad Slots failed by width/height', function() {
        browser.get(browser.params.role + '/tagManagement/adSlots/edit/' + browser.params.edit.adSlotId);

        name.clear();
        width.clear();
        height.clear();

        name.sendKeys('displayAdSlot-test' + tagcadeTestUtil.getDateString(new Date()));
        width.sendKeys('100000000000000000000000000000000000000000000000000000000000');
        height.sendKeys('100000000000000000000000000000000000000000000000000000000000');

        element(by.css('.btn.btn-success')).click();

        expect(element(by.binding('message')).getText()).
            toEqual('An error occurred. The ad slot could not be updated');
    });

    function selectAdSlotTypeDisplay() {
        tagcadeTestUtil.selectAdSlotTypeDisplay('selected.type');
    }

    function selectPublisher(rowId) {
        tagcadeTestUtil.selectItemByModel('selected.publisher', '.ui-select-choices-row-inner', rowId);
    }

    function selectSite(rowId) {
        tagcadeTestUtil.selectItemByModel('adSlot.site', '.ui-select-choices-row-inner', rowId);
    }
});