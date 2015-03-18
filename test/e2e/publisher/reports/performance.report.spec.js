function selectorForPerformance() {
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

function performanceAction() {
    var selector = new selectorForPerformance();

    this.account = function(dateRange, result) {
        selector.dateRange(dateRange);
        selector.selected('selectedData.reportType', 0);
        selector.clickButton();

        expect(result).toBeDefined(true);
    };

    this.adNetwork = function(dateRange, adNetworkId, adNetworkBreakdown, result) {
        selector.dateRange(dateRange);
        selector.selected('selectedData.reportType', 1);
        selector.selected('selectedData.adNetworkId', adNetworkId);
        if(adNetworkId != 0) {
            selector.selected('selectedData.adNetworkBreakdown', adNetworkBreakdown);
        }
        selector.clickButton();

        expect(result).toBeDefined(true);
    };

    this.site = function(dateRange, siteId, siteBreakdown, result) {
        selector.dateRange(dateRange);
        selector.selected('selectedData.reportType', 2);
        selector.selected('selectedData.siteId', siteId);
        if(siteId != 0) {
            selector.selected('selectedData.siteBreakdown', siteBreakdown);
        }
        selector.clickButton();

        expect(result).toBeDefined(true);
    };

    this.adSlot = function(dateRange, siteId, adSlotId, adSlotBreakdown, result) {
        selector.dateRange(dateRange);
        selector.selected('selectedData.reportType', 3);
        selector.selected('selectedData.siteId', siteId);
        selector.selected('selectedData.adSlotId', adSlotId);
        selector.selected('selectedData.adSlotBreakdown', adSlotBreakdown);
        selector.clickButton();

        expect(result).toBeDefined(true);
    };

    this.drillDown = function(result) {
        element(by.repeater('item in sortedAndPaginatedList').row(0).column('{{ item.impressions | number }}')).click();

        expect(result).toBeDefined(true);
    }
}

describe("Performance Test", function() {
    beforeEach(function() {
        browser.get(browser.params.role + '/reports/performance/account');
    });

    var performance = new performanceAction();

    it('account report type', function() {
        var result = element(by.binding('reportGroup.averageEstRevenue | currency'));

        performance.account('This Month', result);
        performance.drillDown(result);

    });

    it('ad network report type', function() {
        var result = element(by.binding('reportGroup.averageEstRevenue | currency'));

        ////all ad network
        performance.adNetwork('Last 30 Days', 0, 0, result);
        performance.drillDown(result);

        //by day
        performance.adNetwork('This Month', 1, 0, result);
        performance.drillDown(result);


        //by site
        performance.adNetwork('Last Month', 1, 1, result);
        performance.drillDown(result);

        // by ad tag
        performance.adNetwork('Last Month', 1, 2, result);
    });

    it('site report type', function() {
        var result = element(by.binding('reportGroup.averageEstRevenue | currency'));

        ////all site
        performance.site('Last 30 Days', 0, 0, result);
        performance.drillDown(result);

        // by day
        performance.site('This Month', 1, 0, result);
        performance.drillDown(result);

        // ad slot
        performance.site('Last Month', 1, 1, result);
        performance.drillDown(result);

        // ad tag
        performance.site('Yesterday', 1, 2, result);

        //ad network
        performance.site('This Month', 1, 3, result);
        performance.drillDown(result);
    });

    it('ad slot report type', function() {
        var result = element(by.binding('reportGroup.averageEstRevenue | currency'));

        // ad slot by day
        performance.adSlot('Last Month', 1, 0, 0, result);
        performance.drillDown(result);

        // ad slot by ad tag
        performance.adSlot('Last Month', 1, 0, 1, result);
    });
});