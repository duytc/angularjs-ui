describe("Ad Tags Test", function() {
    it('update', function() {
        browser.get(browser.params.role + '/tagManagement/adTags/edit/' + browser.params.edit.adTagId);

        var name = element(by.model('adTag.name'));
        var html = element(by.model('adTag.html'));
        var position = element(by.model('adTag.position'));
        var frequencyCap = element(by.model('adTag.frequencyCap'));

        name.clear();
        html.clear();
        position.clear();
        frequencyCap.clear();

        name.sendKeys('adSlot-test');
        html.sendKeys('<h1>test</h1>>');
        position.sendKeys('100');
        frequencyCap.sendKeys('200');

        element(by.css('.btn.btn-success')).click();

        expect(element(by.binding('message')).getText()).
            toEqual('The ad tag has been updated');
    });

    it('drag drop', function() {
        browser.get(browser.params.role + '/tagManagement/adTags/list/adslot/' + browser.params.edit.adSlotId);

        var getRow = function (num){
            return element(by.repeater('adTag in adTags').row(num));
        };

        browser.driver.actions()
            .mouseDown(getRow(0))
            .mouseUp(getRow(1))
            .perform();

        expect(element(by.binding('message')).getText()).
                toEqual('The ad tags have been reordered');
    });
});