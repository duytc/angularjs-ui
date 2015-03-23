describe("Publisher Management Test", function() {
    it('publisher list', function() {

        browser.get('#/adm/userManagement/list');

        expect(browser.getTitle()).
            toEqual('Publishers | Tagcade Platform');
    });

    it('Login as publisher', function() {

        browser.get('#/adm/userManagement/list');

        element.all(by.cssContainingText('button', 'Actions')).then(function(items) {
            items[0].click()
        });

        element.all(by.cssContainingText('a', 'Login as this publisher')).then(function(items) {
            items[0].click()
        });

        expect(browser.getTitle()).
            toEqual('Dashboard | Tagcade Platform');

        element(by.cssContainingText('span', 'Return to admin account')).click();

        expect(browser.getTitle()).
            toEqual('Publishers | Tagcade Platform');
    });

    it('publisher update', function() {

        browser.get('#/adm/userManagement/edit/' + browser.params.edit.publisherId);

        var username = element(by.model('publisher.username'));
        var password = element(by.model('publisher.plainPassword'));
        var repeatPassword = element(by.model('repeatPassword'));
        var firstName = element(by.model('publisher.firstName'));
        var lastName = element(by.model('publisher.lastName'));
        var company = element(by.model('publisher.company'));
        var email = element(by.model('publisher.email'));
        var address = element(by.model('publisher.address'));
        var phone = element(by.model('publisher.phone'));
        var postalCode = element(by.model('publisher.postalCode'));
        var city = element(by.model('publisher.city'));
        var state = element(by.model('publisher.state'));
        var country = element(by.model('publisher.country'));

        username.clear();
        password.clear();
        repeatPassword.clear();
        firstName.clear();
        lastName.clear();
        company.clear();
        email.clear();
        phone.clear();
        address.clear();
        postalCode.clear();
        city.clear();
        state.clear();

        username.sendKeys('test2');
        password.sendKeys('test2');
        repeatPassword.sendKeys('test2');
        firstName.sendKeys('unit');
        lastName.sendKeys('test');
        company.sendKeys('D-TAG Viet Nam');
        email.sendKeys('test32@gmail.com');
        phone.sendKeys('0988888888');
        address.sendKeys('Ha Noi');
        postalCode.sendKeys('8000');
        city.sendKeys('Ha Noi');
        state.sendKeys(':)');
        country.sendKeys('Viet Nam');

        element(by.css('.btn.btn-success')).click();

        expect(element(by.binding('message')).getText()).
            toEqual('The publisher has been updated');
    });
});