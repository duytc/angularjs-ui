function selectedForProjectedBill() {
    this.selected = function(selectedButton, selectedRow) {
        element(by.model(selectedButton)).click();
        element.all(by.css('.ui-select-choices-row')).then(function(items) {
            items[selectedRow].click()
        });
    };

    this.clickButton = function() {
        return element(by.css('.btn.btn-primary')).click();
    }
}

describe("ProjectedBill Test", function() {
    beforeEach(function() {
        browser.get(browser.params.role + '/reports/projectedBill/platform');
    });

    var projectedBill = new selectedForProjectedBill();

    it('platform', function() {
        expect(element(by.binding('reportGroup.projectedBilledAmount | currency'))).
            toBeDefined(true);
    });

    it('account', function() {
        projectedBill.selected('selectedData.reportType', 1);
        projectedBill.selected('selectedData.publisherId', 0);
        projectedBill.clickButton();

        expect(element(by.binding('reportGroup.projectedBilledAmount | currency'))).
            toBeDefined(true);
    });

    it('Site', function() {
        projectedBill.selected('selectedData.reportType', 2);
        projectedBill.selected('selectedData.publisherId', 0);
        projectedBill.selected('selectedData.siteId', 0);
        projectedBill.clickButton();

        expect(element(by.binding('reportGroup.projectedBilledAmount | currency'))).
            toBeDefined(true);
    });
});