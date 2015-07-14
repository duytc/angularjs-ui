describe("Login Test", function () {

    var username = element(by.model('credentials.username'));
    var password = element(by.model('credentials.password'));

    beforeEach(function() {
        browser.get('#/login');
    });

    afterEach(function () {
        if (this.results_.failedCount > 0) {
            browser.quit();
        }
    });

    it('should login failed with wrong account', function () {
        username.sendKeys('admin2');
        password.sendKeys('admin');

        element(by.css('.btn.btn-primary')).click();

        expect(element(by.binding('message')).getText()).
            toEqual('Login failed, did you provide an invalid username and/or password?');
    });

    it('should login successfully', function () {
        username.clear();
        password.clear();

        username.sendKeys(browser.params.login.username);
        password.sendKeys(browser.params.login.password);

        element(by.css('.btn.btn-primary')).click();

        expect(browser.getTitle()).
            toEqual('Dashboard | Tagcade Platform');
    });
});