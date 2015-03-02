function selectorForCpmEditor() {
    this.dateRange = function(selectedDate) {
        element(by.model('selectedData.date')).click();
        element(by.cssContainingText('li', selectedDate)).click();

    };

    this.selected = function(selectedButton, selectedRow) {
        element(by.model(selectedButton)).click();
        element.all(by.css('.ui-select-choices-row')).then(function(items) {
            items[selectedRow].click()
        });
    };

    this.clickButton = function() {
        return element(by.css('.btn.btn-success')).click();
    };
}

describe("Cpm editor", function() {
    beforeEach(function() {
        browser.get(browser.params.role + '/supportTools/CpmEditor');
    });

    var cpmEditor = new selectorForCpmEditor();

    it('Update CPM for ad tag', function() {
        cpmEditor.selected('selectedData.updateTypes', 0);
        cpmEditor.dateRange('Last Month');
        cpmEditor.selected('selectedData.siteId', 1);
        cpmEditor.selected('selectedData.adSlotId', 0);
        cpmEditor.selected('selectedData.adTagId', 0);
        element(by.model('selectedData.CPM')).sendKeys('10');
        cpmEditor.clickButton();

        expect(element(by.binding('message')).getText()).
            toEqual('The CPM value has been scheduled for updating');
    });

    it('Update CPM for ad network', function() {
        cpmEditor.selected('selectedData.updateTypes', 1);
        cpmEditor.dateRange('This Month');
        cpmEditor.selected('selectedData.adNetworkId', 0);
        element(by.model('selectedData.CPM')).sendKeys('11');
        cpmEditor.clickButton();

        expect(element(by.binding('message')).getText()).
            toEqual('The CPM value has been scheduled for updating');
    });

    it('Update CPM for site', function() {
        cpmEditor.selected('selectedData.updateTypes', 2);
        cpmEditor.dateRange('Last 7 Days');
        cpmEditor.selected('selectedData.adNetworkForSiteId', 1);
        cpmEditor.selected('selectedData.sitesByAdNetworkId', 0);
        element(by.model('selectedData.CPM')).sendKeys('12');
        cpmEditor.clickButton();

        expect(element(by.binding('message')).getText()).
            toEqual('The CPM value has been scheduled for updating');
    })
});