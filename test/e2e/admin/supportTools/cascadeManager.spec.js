function selectorForCascade() {
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

describe("cascadeManager", function() {
    beforeEach(function() {
        browser.get(browser.params.role + '/supportTools/cascadeManager/edit');
    });

    var cpmEditor = new selectorForCascade();

    it('All Site', function() {
        cpmEditor.selected('selected.publisher', 0);
        cpmEditor.selected('selected.adNetwork', 0);
        cpmEditor.selected('selected.site', 0);
        element(by.model('selected.position')).sendKeys('10');
        cpmEditor.clickButton();

        expect(element(by.binding('message')).getText()).
            toEqual('The ad network position has been updated');
    });

    it('site', function() {
        cpmEditor.selected('selected.publisher', 0);
        cpmEditor.selected('selected.adNetwork', 1);
        cpmEditor.selected('selected.site', 1);
        element(by.model('selected.position')).sendKeys('10');
        cpmEditor.clickButton();

        expect(element(by.binding('message')).getText()).
            toEqual('The ad network position has been updated');
    });
});