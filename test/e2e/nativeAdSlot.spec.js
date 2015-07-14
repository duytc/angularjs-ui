exports.test = function (userRoleTest) {

    var userRole = (!userRoleTest || userRoleTest !== 'admin') ? 'publisher' : userRoleTest;
    console.log('test spec with userRole: ' + userRole + ' =============');

    describe("Native Ad Slots Test", function () {

        var tagcadeTestUtil = require('./util/tagcade.test.util');

        var name = element(by.model('adSlot.name'));

        beforeEach(function () {
        });

        afterEach(function () {
            if (this.results_.failedCount > 0) {
                browser.quit();
            }
        });

        it('should create Native Ad Slots successfully', function () {
            browser.get(browser.params.role + '/tagManagement/adSlots/new');

            selectAdSlotTypeNative();

            if (isAdmin()) {
                selectPublisher(0);
            }

            selectSite(0);

            name.sendKeys('nativeAdSlot-test' + tagcadeTestUtil.getDateString(new Date()));

            element(by.css('.btn.btn-success')).click();

            expect(element(by.binding('message')).getText()).
                toEqual('The ad slot has been created');
        });

        it('should create Native Ad Slots successfully although too long name', function () {
            browser.get(browser.params.role + '/tagManagement/adSlots/new');

            selectAdSlotTypeNative();

            if (isAdmin()) {
                selectPublisher(0);
            }

            selectSite(0);

            name.sendKeys('nativeAdSlot-test' + tagcadeTestUtil.getDateString(new Date()) + '-qwertyuiopasdfghjklzxcvbnmqwertyuiopasdfghjklzxcvbnmqwertFFFFFFFFFF');

            element(by.css('.btn.btn-success')).click();

            //expect(element(by.binding('message')).getText()).
            //    toEqual('An error occurred. The ad slot could not be created');
            expect(element(by.binding('message')).getText()).
                toEqual('The ad slot has been created');
        });

        it('should update Native Ad Slots successfully', function () {
            browser.get(browser.params.role + '/tagManagement/adSlots/edit/' + browser.params.edit.nativeAdSlotId);

            name.clear();
            name.sendKeys('nativeAdSlot-test' + tagcadeTestUtil.getDateString(new Date()));

            element(by.css('.btn.btn-success')).click();

            expect(element(by.binding('message')).getText()).
                toEqual('The ad slot has been updated');
        });

        it('should update Native Ad Slots successfully although too long name', function () {
            browser.get(browser.params.role + '/tagManagement/adSlots/edit/' + browser.params.edit.nativeAdSlotId);

            name.clear();
            name.sendKeys('nativeAdSlot-test' + tagcadeTestUtil.getDateString(new Date()));

            element(by.css('.btn.btn-success')).click();

            //expect(element(by.binding('message')).getText()).
            //    toEqual('An error occurred. The ad slot could not be updated');
            expect(element(by.binding('message')).getText()).
                toEqual('The ad slot has been updated');
        });

        function selectAdSlotTypeNative() {
            tagcadeTestUtil.selectAdSlotTypeNative('selected.type');
        }

        function selectPublisher(rowId) {
            tagcadeTestUtil.selectItemByModel('selected.publisher', '.ui-select-choices-row-inner', rowId);
        }

        function selectSite(rowId) {
            tagcadeTestUtil.selectItemByModel('adSlot.site', '.ui-select-choices-row-inner', rowId);
        }
    });

    function isAdmin() {
        return userRole === 'admin';
    }
};
