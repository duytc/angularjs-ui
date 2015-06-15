describe("Ad Slots Test", function() {
    it('Ad Slots update', function() {

        browser.get(browser.params.role + '/tagManagement/adSlots/edit/' + browser.params.edit.adSlotId);

        var name = element(by.model('adSlot.name'));
        var width = element(by.model('adSlot.width'));
        var height = element(by.model('adSlot.height'));

        name.clear();
        width.clear();
        height.clear();

        name.sendKeys('adSlot-test');
        width.sendKeys('100');
        height.sendKeys('200');

        element(by.css('.btn.btn-success')).click();

        expect(element(by.binding('message')).getText()).
            toEqual('The ad slot has been updated');
    });

    it('native Ad Slots new', function() {

        browser.get(browser.params.role + '/tagManagement/adSlots/new?siteId=' + browser.params.edit.siteId);

        element(by.model('selected.type')).click();
        element.all(by.css('.ui-select-choices-row')).then(function(items) {
            items[1].click()
        });

        var name = element(by.model('adSlot.name'));
        name.clear();
        name.sendKeys('adSlot-test-new');

        element(by.css('.btn.btn-success')).click();

        expect(element(by.binding('message')).getText()).
            toEqual('The ad slot has been created');
    });
});