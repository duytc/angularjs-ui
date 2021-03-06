function selectedForProjectedBill() {
    this.selected = function(selectedButton, selectedRow) {
        element(by.model(selectedButton)).click();
        element.all(by.css('.ui-select-choices-row')).then(function(items) {
            items[selectedRow].click()
        });
    };

    this.clickButton = function() {
        return element.all(by.css('.btn.btn-primary')).then(function(items) {
            items[0].click()
        });
    }
}

describe("ProjectedBill Test", function() {
    beforeEach(function() {
        browser.get(browser.params.role + '/reports/projectedBill/account');
    });

    var projectedBill = new selectedForProjectedBill();

    it('account', function() {
        projectedBill.selected('selectedData.reportType', 0);
        projectedBill.clickButton();

        expect(element(by.binding('reportGroup.projectedBilledAmount | currency'))).
            toBeDefined(true);
    });

    it('Site', function() {
        projectedBill.selected('selectedData.reportType', 1);
        projectedBill.selected('selectedData.siteId', 0);
        projectedBill.clickButton();

        expect(element(by.binding('reportGroup.projectedBilledAmount | currency'))).
            toBeDefined(true);
    });
});