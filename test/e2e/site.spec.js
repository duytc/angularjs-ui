exports.test = function (userRoleTest) {

    var userRole = (!userRoleTest || userRoleTest !== 'admin') ? 'publisher' : userRoleTest;
    console.log('test spec with userRole: ' + userRole + ' =============');
    describe("Site Test", function () {
        var tagcadeTestUtil = require('./util/tagcade.test.util');

        beforeEach(function () {
        });

        afterEach(function () {
            if (this.results_.failedCount > 0) {
                browser.quit();
            }
        });

        it('should list Sites', listSites);

        it('should create Site successfully', function () {
            browser.get(browser.params.role + '/tagManagement/sites/new');

            if (isAdmin()) {
                selectPublisher(0);
            }

            var name = getElementAsName();
            var domain = getElementAsDomain();
            var sourceReport = getElementAsSourceReport();

            name.sendKeys('site-test' + tagcadeTestUtil.getDateString(new Date()));
            domain.sendKeys('site-test.dev');
            sourceReport.click();

            element(by.css('.btn.btn-success')).click();

            expect(element(by.binding('message')).getText()).
                toEqual('The site has been created');
        });

        it('should create Site successfully although name too long', function () {
            browser.get(browser.params.role + '/tagManagement/sites/new');

            if (isAdmin()) {
                selectPublisher(0);
            }

            var name = getElementAsName();
            var domain = getElementAsDomain();
            var sourceReport = getElementAsSourceReport();

            name.sendKeys('site-test' + tagcadeTestUtil.getDateString(new Date()) + '-qwertyuiopasdfghjklzxcvbnmqwertyuiopasdfghjklzxcvbnmqwertFFFFFFFFFFFFFFFFFFFF');
            domain.sendKeys('site-test.dev');
            sourceReport.click();

            element(by.css('.btn.btn-success')).click();

            expect(element(by.binding('message')).getText()).
                toEqual('The site has been created');
        });

        it('should create Site failed by domain invalid', function () {
            browser.get(browser.params.role + '/tagManagement/sites/new');

            if (isAdmin()) {
                selectPublisher(0);
            }

            var name = getElementAsName();
            var domain = getElementAsDomain();
            var sourceReport = getElementAsSourceReport();

            name.sendKeys('site-test' + tagcadeTestUtil.getDateString(new Date()));
            domain.sendKeys('@@@.site-test.dev');
            sourceReport.click();

            element(by.css('.btn.btn-success')).click();

            expect(element(by.binding('message')).getText()).
                toEqual('This value is not a valid URL.');
        });

        it('should update Site successfully', function () {
            browser.get(browser.params.role + '/tagManagement/sites/edit/' + browser.params.edit.siteId);

            var name = getElementAsName();
            var domain = getElementAsDomain();
            var sourceReport = getElementAsSourceReport();

            name.clear();
            domain.clear();

            name.sendKeys('site-test' + tagcadeTestUtil.getDateString(new Date()));
            domain.sendKeys('site-test.dev');
            sourceReport.click();

            element(by.css('.btn.btn-success')).click();

            expect(element(by.binding('message')).getText()).
                toEqual('The site has been updated');
        });

        it('should update Site successfully although name too long', function () {
            browser.get(browser.params.role + '/tagManagement/sites/edit/' + browser.params.edit.siteId);

            var name = getElementAsName();
            var domain = getElementAsDomain();
            var sourceReport = getElementAsSourceReport();

            name.clear();
            domain.clear();

            name.sendKeys('site-test' + tagcadeTestUtil.getDateString(new Date()) + '-qwertyuiopasdfghjklzxcvbnmqwertyuiopasdfghjklzxcvbnmqwertFFFFFFFFFFFFFFFFFFFF');
            domain.sendKeys('site-test.dev');
            sourceReport.click();

            element(by.css('.btn.btn-success')).click();

            expect(element(by.binding('message')).getText()).
                toEqual('The site has been updated');
        });

        it('should update Site failed by domain invalid', function () {
            browser.get(browser.params.role + '/tagManagement/sites/edit/' + browser.params.edit.siteId);

            var name = getElementAsName();
            var domain = getElementAsDomain();
            var sourceReport = getElementAsSourceReport();

            name.clear();
            domain.clear();

            name.sendKeys('site-test' + tagcadeTestUtil.getDateString(new Date()));
            domain.sendKeys('@@@.site-test.dev');
            sourceReport.click();

            element(by.css('.btn.btn-success')).click();

            expect(element(by.binding('message')).getText()).
                toEqual('This value is not a valid URL.');
        });

        it('should delete a site successfully', function () {
            listSites();

            element.all(by.css('.btn-group')).then(function (items) {
                items[5].click();

                items[5]
                    .element(by.css('.dropdown-menu.pull-right-dropdown'))
                    .all(by.tagName('a')).each(function (element, index) {
                        element.getText().then(function (text) {
                            console.log('text: ' + text);
                            if (text === 'Delete Site') {
                                element.click();
                            }
                        });
                    });
            });

            element(by.css('.modal-dialog-footer.ng-scope')).element(by.buttonText('Yes, delete')).click();

            expect(element(by.binding('message')).getText()).
                toEqual('The site was deleted');

            expect(browser.getTitle()).
                toEqual('Sites | Tagcade Platform');
        });

        function listSites () {
            browser.get(browser.params.role + '/tagManagement/sites/list?sortField=id&orderBy=asc');

            expect(browser.getTitle()).
                toEqual('Sites | Tagcade Platform');
        }

        function getElementAsName() {
            return element(by.model('site.name'));
        }

        function getElementAsDomain() {
            return element(by.model('site.domain'));
        }

        function getElementAsSourceReport() {
            return element(by.css('.ui-checkbox'));
        }

        function selectPublisher(rowId) {
            tagcadeTestUtil.selectItemByModel('site.publisher', '.ui-select-choices-row-inner', rowId);
        }
    });

    function isAdmin() {
        return userRole === 'admin';
    }
};