exports.test = function (userRoleTest) {

    var userRole = (!userRoleTest || userRoleTest !== 'admin') ? 'publisher' : userRoleTest;
    console.log('test spec with userRole: ' + userRole + ' =============');

    describe("Ad Slots Test", function () {
        var tagcadeTestUtil = require('./util/tagcade.test.util');

        beforeEach(function () {
        });

        afterEach(function () {
            if (this.results_.failedCount > 0) {
                browser.quit();
            }
        });

        it('should list Ad Slots', listAdSlots);

        it('should delete an Ad slot', function () {
            if (isAdmin()) {
                console.log('delete an Ad slot from list only supported publisher');
                return;
            }

            listAdSlots();

            element.all(by.css('.btn-group')).then(function (items) {
                items[6].click();

                items[6]
                    .element(by.css('.dropdown-menu.pull-right-dropdown'))
                    .all(by.tagName('a')).each(function (element, index) {
                        element.getText().then(function (text) {
                            console.log('text: ' + text);
                            if (text === 'Delete Ad Slot') {
                                element.click();
                            }
                        });
                    });
            });

            element(by.css('.modal-dialog-footer.ng-scope')).element(by.buttonText('Yes, delete')).click();

            expect(browser.getTitle()).
                toEqual('Ad Slots | Tagcade Platform');
        });

        it('should clone an Ad slot', function () {
            if (isAdmin()) {
                console.log('delete an Ad slot from list only supported publisher');
                return;
            }

            listAdSlots();

            element.all(by.css('.btn-group')).then(function (items) {
                items[6].click();

                items[6]
                    .element(by.css('.dropdown-menu.pull-right-dropdown'))
                    .all(by.tagName('a')).each(function (element, index) {
                        element.getText().then(function (text) {
                            console.log('text: ' + text);
                            if (text === 'Clone Ad Slot') {
                                element.click();
                            }
                        });
                    });
            });

            //dialog for clone ad slot
            var dialog = element(by.css('.modal-content'));
            var dialogBody = dialog.element(by.css('.modal-body'));

            var name = dialogBody.element(by.model('cloneAdSlot.name'));
            var site = dialogBody.element(by.model('cloneAdSlot.site'));

            name.clear();
            name.sendKeys('adSlot-test-clone' + tagcadeTestUtil.getDateString(new Date()));

            site.click()
                .all(by.css('.ui-select-choices-row-inner'))
                .then(function (items) {
                    items[1].click();
                });

            var dialogFooter = dialog.element(by.css('.modal-footer'));
            dialogFooter.element(by.buttonText('Submit')).click();

            //expect result
            expect(browser.getTitle()).
                toEqual('Ad Slots | Tagcade Platform');
        });

        function listAdSlots() {
            browser.get(browser.params.role + '/tagManagement/adSlots/list');

            expect(browser.getTitle()).
                toEqual('Ad Slots | Tagcade Platform');
        }
    });

    function isAdmin() {
        return userRole === 'admin';
    }
};
