function selectedForSource() {
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

describe("Source Test", function() {
    beforeEach(function() {
        browser.get(browser.params.role + '/reports/source');
    });

    var source = new selectedForSource();

    it('Site Date Range', function() {
        source.dateRange('Last Month');
        source.selected('selectedData.siteId', 0);
        source.clickButton();

        expect(element(by.binding('reportGroup.averageVisits | number'))).
            toBeDefined(true);

        ///

        element(by.repeater('item in sortedAndPaginatedList').
            row(0).column('{{ item.visits | number }}')).click();

        expect(element(by.binding('reportGroup.visits | number'))).
            toBeDefined(true);
    });
});