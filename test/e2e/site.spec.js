describe("Site Test", function() {
    it('Site list', function() {

        browser.get(browser.params.role + '/tagManagement/sites/list');

        expect(browser.getTitle()).
            toEqual('Sites | Tagcade Platform');
    });

    it('Site update', function() {

        browser.get(browser.params.role + '/tagManagement/sites/edit/' + browser.params.edit.siteId);

        var name = element(by.model('site.name'));
        var domain = element(by.model('site.domain'));

        name.clear();
        domain.clear();

        name.sendKeys('site-test');
        domain.sendKeys('site-test.dev');

        element(by.css('.btn.btn-success')).click();

        expect(element(by.binding('message')).getText()).
            toEqual('The site has been updated');
    });
});