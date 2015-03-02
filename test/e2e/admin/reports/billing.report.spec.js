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
        return element(by.css('.btn.btn-primary')).click();
    }
}

describe("Billing Test", function() {
    beforeEach(function() {
        browser.get(browser.params.role + '/reports/billing/platform');
    });

    var billing = new selectedForBilling();

    it('platform', function() {
        billing.dateRange('Last Month');
        billing.clickButton();

        expect(element(by.binding('reportGroup.slotOpportunities | number'))).
            toBeDefined(true);
    });

    it('account', function() {
        billing.dateRange('This Month');
        billing.selected('selectedData.reportType', 1);
        billing.selected('selectedData.publisherId', 0);
        billing.clickButton();

        expect(element(by.binding('reportGroup.slotOpportunities | number'))).
            toBeDefined(true);
    });

    it('Site', function() {
        billing.dateRange('Last 30 Days');
        billing.selected('selectedData.reportType', 2);
        billing.selected('selectedData.publisherId', 0);
        billing.selected('selectedData.siteId', 2);
        billing.clickButton();

        expect(element(by.binding('reportGroup.slotOpportunities | number'))).
            toBeDefined(true);
    });
});