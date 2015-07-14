exports.test = function (userRoleTest) {

    var userRole = (!userRoleTest || userRoleTest !== 'admin') ? 'publisher' : userRoleTest;
    console.log('test spec with userRole: ' + userRole + ' =============');

    describe("Dynamic Ad Slots Test", function () {

        var tagcadeTestUtil = require('./util/tagcade.test.util');

        var name = element(by.model('adSlot.name'));
        var native = element(by.css('.ui-checkbox'));

        var EC = protractor.ExpectedConditions;

        beforeEach(function () {
        });

        afterEach(function () {
            if (this.results_.failedCount > 0) {
                browser.quit();
            }
        });

        it('should create Dynamic Ad Slots successfully', function () {
            browser.get(browser.params.role + '/tagManagement/adSlots/new');

            selectAdSlotTypeDynamic();

            if (isAdmin()) {
                selectPublisher(0);
            }

            selectSite(0);

            selectDefaultAdSlot(1);

            name.sendKeys('dynamicAdSlot-test' + tagcadeTestUtil.getDateString(new Date()));

            element(by.buttonText('Submit')).click();

            expect(element(by.binding('message')).getText()).
                toEqual('The ad slot has been created');
        });

        it('should create Dynamic Ad Slots successfully with native checked', function () {
            browser.get(browser.params.role + '/tagManagement/adSlots/new');

            selectAdSlotTypeDynamic();

            if (isAdmin()) {
                selectPublisher(0);
            }

            selectSite(0);

            selectDefaultAdSlot(1);

            name.sendKeys('dynamicAdSlot-test' + tagcadeTestUtil.getDateString(new Date()));
            native.click();

            element(by.buttonText('Submit')).click();

            expect(element(by.binding('message')).getText()).
                toEqual('The ad slot has been created');
        });

        it('should create Dynamic Ad Slots successfully although too long name', function () {
            browser.get(browser.params.role + '/tagManagement/adSlots/new');

            selectAdSlotTypeDynamic();

            if (isAdmin()) {
                selectPublisher(0);
            }

            selectSite(0);

            selectDefaultAdSlot(1);

            name.sendKeys('dynamicAdSlot-test' + tagcadeTestUtil.getDateString(new Date()) + '-qwertyuiopasdfghjklzxcvbnmqwertyuiopasdfghjklzxcvbnmqwertFFFFFFFFFF');

            element(by.buttonText('Submit')).click();

            //expect(element(by.binding('message')).getText()).
            //    toEqual('An error occurred. The ad slot could not be created');
            expect(element(by.binding('message')).getText()).
                toEqual('The ad slot has been created');
        });

        it('should create Dynamic Ad Slots successfully with expression', function () {
            browser.get(browser.params.role + '/tagManagement/adSlots/new');

            selectAdSlotTypeDynamic();

            if (isAdmin()) {
                selectPublisher(0);
            }

            selectSite(0);

            selectDefaultAdSlot(1);

            name.sendKeys('dynamicAdSlot-test' + tagcadeTestUtil.getDateString(new Date()));

            //expression
            element(by.buttonText('Add Expression')).click();

            selectExpectedAdSlot(0);

            selectStartingPosition(0);

            element(by.buttonText('Add Condition')).click();
            element(by.model('searchStr')).sendKeys('var1');
            element(by.model('itemGroup.val')).sendKeys('var1 value');

            //submit
            element(by.buttonText('Submit')).click();

            //expect result
            expect(element(by.binding('message')).getText()).
                toEqual('The ad slot has been created');
        });

        it('should update Dynamic Ad Slots successfully', function () {
            browser.get(browser.params.role + '/tagManagement/adSlots/edit/' + browser.params.edit.dynamicAdSlotId);

            name.clear();
            name.sendKeys('dynamicAdSlot-test' + tagcadeTestUtil.getDateString(new Date()));

            element(by.buttonText('Submit')).click();

            expect(element(by.binding('message')).getText()).
                toEqual('The ad slot has been updated');
        });

        it('should update Dynamic Ad Slots successfully with non-clickable native checkBox', function () {
            browser.get(browser.params.role + '/tagManagement/adSlots/edit/' + browser.params.edit.dynamicAdSlotId);

            name.clear();
            name.sendKeys('dynamicAdSlot-test' + tagcadeTestUtil.getDateString(new Date()));

            expect(EC.elementToBeClickable(native) === false);

            element(by.buttonText('Submit')).click();

            expect(element(by.binding('message')).getText()).
                toEqual('The ad slot has been updated');
        });

        it('should update Dynamic Ad Slots successfully although too long name', function () {
            browser.get(browser.params.role + '/tagManagement/adSlots/edit/' + browser.params.edit.dynamicAdSlotId);

            name.clear();
            name.sendKeys('dynamicAdSlot-test' + tagcadeTestUtil.getDateString(new Date()));

            expect(EC.elementToBeClickable(native) === false);

            element(by.buttonText('Submit')).click();

            //expect(element(by.binding('message')).getText()).
            //    toEqual('An error occurred. The ad slot could not be updated');
            expect(element(by.binding('message')).getText()).
                toEqual('The ad slot has been updated');
        });

        function selectAdSlotTypeDynamic() {
            tagcadeTestUtil.selectAdSlotTypeDynamic('selected.type');
        }

        function selectPublisher(rowId) {
            tagcadeTestUtil.selectItemByModel('selected.publisher', '.ui-select-choices-row-inner', rowId);
        }

        function selectSite(rowId) {
            tagcadeTestUtil.selectItemByModel('adSlot.site', '.ui-select-choices-row-inner', rowId);
        }

        function selectDefaultAdSlot(rowId) {
            tagcadeTestUtil.selectItemByModel('adSlot.defaultAdSlot', '.ui-select-choices-row-inner', rowId);
        }

        function selectExpectedAdSlot(rowId) {
            tagcadeTestUtil.selectItemByModel('expressionRoot.expectAdSlot', '.ui-select-choices-row-inner', rowId);
        }

        function selectStartingPosition(rowId) {
            tagcadeTestUtil.selectItemByModel('expressionRoot.startingPosition', '.ui-select-choices-row-inner', rowId);
        }
    });

    function isAdmin() {
        return userRole === 'admin';
    }
};


