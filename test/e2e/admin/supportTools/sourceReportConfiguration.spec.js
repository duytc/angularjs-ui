function selectorSourceReportConfig() {
    this.selected = function(selectedButton, selectedNumberButton, selectedRow) {
        element.all(by.model(selectedButton)).then(function(items) {
            items[selectedNumberButton].click();
        });
        element.all(by.css('.ui-select-choices-row')).then(function(items) {
            items[selectedRow].click()
        });
    };

    this.clickButton = function() {
        return element.all(by.css('.btn.btn-success')).then(function(items) {
            items[0].click()
        });
    };
}

describe("Source Report Configuration", function() {
    var sourceReportConfig = new selectorSourceReportConfig();

    it('list email config', function() {
        browser.get(browser.params.role + '/supportTools/sourceReportConfiguration/list');

        sourceReportConfig.selected('selected.publisher', 0, 1);

        expect(browser.getTitle()).
            toEqual('Source Report Configuration | Tagcade Platform');

        sourceReportConfig.selected('selected.publisher', 0, 0);

        expect(browser.getTitle()).
            toEqual('Source Report Configuration | Tagcade Platform');

    });

    it('add email config', function() {
        element.all(by.css('.btn.btn-primary')).then(function(items) {
            items[0].click()
        });

        element(by.model('emailReceive.email')).sendKeys('dtag.test.e2e@dev.com');
        sourceReportConfig.selected('selected.publisher', 1, 1);

        element.all(by.css('.glyphicon.glyphicon-arrow-right')).then(function(items) {
            items[0].click()
        });

        sourceReportConfig.clickButton();

        expect(element(by.binding('message')).getText()).
            toEqual('The email config has been updated');
    });

    it('delete site config for email', function() {
        browser.get(browser.params.role + '/supportTools/sourceReportConfiguration/listSiteConfig/email/' + browser.params.edit.emailConfig);

        element.all(by.css('.btn-group')).then(function(items) {
            items[0].click()
        });

        element.all(by.cssContainingText('.dropdown-menu', 'Delete This Config')).then(function(items) {
            items[0].click()
        });

        element.all(by.css('.btn.btn-danger')).then(function(items) {
            items[0].click()
        });

        expect(element(by.binding('message')).getText()).
            toEqual('The site config has been deleted');
    });

    it('add site by email config', function() {
        element.all(by.css('.btn.btn-primary')).then(function(items) {
            items[1].click()
        });

        sourceReportConfig.selected('selected.publisher', 0, 1);

        element.all(by.css('.glyphicon.glyphicon-arrow-right')).then(function(items) {
            items[0].click()
        });

        sourceReportConfig.clickButton();

        expect(element(by.binding('message')).getText()).
            toEqual('The email config has been updated');
    });
});