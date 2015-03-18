function selectedForBilling() {
    this.dateRange = function(selectedDate) {
        element(by.css('#inputDateRange')).click();
        element(by.cssContainingText('li', selectedDate)).click();
    };

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

describe("Billing Test", function() {
    beforeEach(function() {
        browser.get(browser.params.role + '/reports/billing/account');
    });

    var billing = new selectedForBilling();

    it('account', function() {
        billing.dateRange('Last Month');
        billing.clickButton();

        expect(element(by.binding('reportGroup.averageBilledAmount | currency'))).
            toBeDefined(true);
    });

    it('Site', function() {
        billing.dateRange('Last 30 Days');
        billing.selected('selectedData.reportType', 1);
        billing.selected('selectedData.siteId', 0);
        billing.clickButton();

        expect(element(by.binding('reportGroup.averageBilledAmount | currency'))).
            toBeDefined(true);
    });
});