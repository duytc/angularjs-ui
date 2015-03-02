describe("Login Test", function() {
    it('should login', function() {

        browser.get('#/login');

        var username = element(by.model('credentials.username'));
        var password = element(by.model('credentials.password'));

        username.sendKeys('admin2');
        password.sendKeys('admin');

        element(by.css('.btn.btn-primary')).click();

        expect(element(by.binding('message')).getText()).
            toEqual('Login failed, did you provide an invalid username and/or password?');

        /////

        username.clear();
        password.clear();

        username.sendKeys(browser.params.login.username);
        password.sendKeys(browser.params.login.password);

        element(by.css('.btn.btn-primary')).click();

        expect(browser.getTitle()).
            toEqual('Dashboard | Tagcade Platform');
    });
});