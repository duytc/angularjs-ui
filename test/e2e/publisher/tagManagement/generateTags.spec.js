describe("generateTags Test", function() {
    it('generate', function() {

        browser.get(browser.params.role + '/tagManagement/generateTags');

        element(by.model('selected.site')).click();
        element.all(by.css('.ui-select-choices-row')).then(function(items) {
            items[0].click()
        });

        element(by.css('.btn.btn-success')).click();

        expect(element(by.binding('jstags.header'))).
            toBeDefined(true);
    });
});