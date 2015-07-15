exports.test = function (userRoleTest) {

    var userRole = (!userRoleTest || userRoleTest !== 'admin') ? 'publisher' : userRoleTest;
    console.log('test spec with userRole: ' + userRole + ' =============');

    describe("Ad Tags Test", function () {
        var tagcadeTestUtil = require('./util/tagcade.test.util');

        beforeEach(function () {
        });

        afterEach(function () {
            if (this.results_.failedCount > 0) {
                browser.quit();
            }
        });

        it('should create Ad Tag successfully', function () {
            browser.get(browser.params.role + '/tagManagement/adTags/new');

            if (isAdmin()) {
                selectPublisher(0);
            }

            selectSite(0);
            selectAdSlot(0);
            selectAdNetwork(0);

            //Custom Ad is selected by default

            var name = getElementAsName();

            var html = getElementAsHtml(); //for CustomAd only
            var position = getElementAsPosition();
            var rotation = getElementAsRotationWeight();
            var frequencyCap = getElementAsFreqCap();

            name.sendKeys('adTag-test' + tagcadeTestUtil.getDateString(new Date()));

            //TODO: still error 'org.openqa.selenium.WebDriverException: unknown error: cannot focus element'
            html.sendKeys('<h1>test</h1>>'); //for CustomAd only
            //TODO: still error 'org.openqa.selenium.WebDriverException: unknown error: cannot focus element'

            position.sendKeys('100');
            rotation.sendKeys('50');
            frequencyCap.sendKeys('200');

            browser.pause();

            element(by.css('.btn.btn-success')).click();

            expect(element(by.binding('message')).getText()).
                toEqual('The ad tag has been created');
        });

        it('should create Ad Tag successfully with default values', function () {
            browser.get(browser.params.role + '/tagManagement/adTags/new');

            if (isAdmin()) {
                selectPublisher(0);
            }

            selectSite(0);
            selectAdSlot(0);
            selectAdNetwork(0);

            //Custom Ad is selected by default

            var name = getElementAsName();
            var html = getElementAsHtml(); //for CustomAd only

            name.sendKeys('adTag-test' + tagcadeTestUtil.getDateString(new Date()));
            html.sendKeys('<h1>test</h1>>'); //for CustomAd only
            //position.sendKeys(''); //empty for default
            //rotation.sendKeys(''); //empty for default
            //frequencyCap.sendKeys(''); //empty for default

            element(by.css('.btn.btn-success')).click();

            expect(element(by.binding('message')).getText()).
                toEqual('The ad tag has been updated');
        });

        it('should create Ad Tag successfully with ImageAd', function () {
            browser.get(browser.params.role + '/tagManagement/adTags/new');

            if (isAdmin()) {
                selectPublisher(0);
            }

            selectSite(0);
            selectAdSlot(0);
            selectAdNetwork(0);

            //Image Ad is selected
            selectImageAd();

            var name = getElementAsName();
            var imageUrl = getElementAsImageUrlForImageAd(); //for ImageAd only
            var targetUrl = getElementAsTargetUrlForImageAd(); //for ImageAd only
            var position = getElementAsPosition();
            var rotation = getElementAsRotationWeight();
            var frequencyCap = getElementAsFreqCap();

            name.sendKeys('adTag-test' + tagcadeTestUtil.getDateString(new Date()));
            imageUrl.sendKeys('http://www.imageAd.test/imageUrl.jpg'); //for ImageAd only
            targetUrl.sendKeys('http://www.imageAd.test/targetUrl.jpg'); //for ImageAd only
            position.sendKeys('100');
            rotation.sendKeys('50');
            frequencyCap.sendKeys('200');

            element(by.css('.btn.btn-success')).click();

            expect(element(by.binding('message')).getText()).
                toEqual('The ad tag has been updated');
        });

        it('should create Ad Tag successfully with ImageAd and default values', function () {
            browser.get(browser.params.role + '/tagManagement/adTags/new');

            if (isAdmin()) {
                selectPublisher(0);
            }

            selectSite(0);
            selectAdSlot(0);
            selectAdNetwork(0);

            //Image Ad is selected
            selectImageAd();

            var name = getElementAsName();
            var imageUrl = getElementAsImageUrlForImageAd(); //for ImageAd only
            var targetUrl = getElementAsTargetUrlForImageAd(); //for ImageAd only

            name.sendKeys('adTag-test' + tagcadeTestUtil.getDateString(new Date()));
            imageUrl.sendKeys('http://www.imageAd.test/imageUrl.jpg'); //for ImageAd only
            targetUrl.sendKeys('http://www.imageAd.test/targetUrl.jpg'); //for ImageAd only
            //position.sendKeys(''); //empty for default
            //rotation.sendKeys(''); //empty for default
            //frequencyCap.sendKeys(''); //empty for default

            element(by.css('.btn.btn-success')).click();

            expect(element(by.binding('message')).getText()).
                toEqual('The ad tag has been updated');
        });

        it('should create Ad Tag successfully although name too long (over 100 chars)', function () {
            browser.get(browser.params.role + '/tagManagement/adTags/new');

            if (isAdmin()) {
                selectPublisher(0);
            }

            selectSite(0);
            selectAdSlot(0);
            selectAdNetwork(0);

            //Custom Ad is selected by default

            var name = getElementAsName();
            var html = getElementAsHtml(); //for CustomAd only

            name.sendKeys('adSlot-test' + tagcadeTestUtil.getDateString(new Date()) + '-qwertyuiopasdfghjklzxcvbnmqwertyuiopasdfghjklzxcvbnmqwertFFFFFFFFFFFFFFFFFFFF');
            html.sendKeys('<h1>test</h1>>'); //for CustomAd only
            //position.sendKeys(''); //empty for default
            //rotation.sendKeys(''); //empty for default
            //frequencyCap.sendKeys(''); //empty for default

            element(by.css('.btn.btn-success')).click();

            expect(element(by.binding('message')).getText()).
                toEqual('The ad tag has been updated');
        });

        it('should create Ad Tag with Image Ad failed by invalid imageUrl', function () {
            browser.get(browser.params.role + '/tagManagement/adTags/new');

            if (isAdmin()) {
                selectPublisher(0);
            }

            selectSite(0);
            selectAdSlot(0);
            selectAdNetwork(0);

            //Image Ad is selected
            selectImageAd();

            var name = getElementAsName();
            var imageUrl = getElementAsImageUrlForImageAd(); //for ImageAd only
            var targetUrl = getElementAsTargetUrlForImageAd(); //for ImageAd only

            name.sendKeys('adTag-test' + tagcadeTestUtil.getDateString(new Date()));
            imageUrl.sendKeys('@@@.imageAd.test/imageUrl.jpg'); //for ImageAd only
            targetUrl.sendKeys('http://www.imageAd.test/targetUrl.jpg'); //for ImageAd only
            //position.sendKeys(''); //empty for default
            //rotation.sendKeys(''); //empty for default
            //frequencyCap.sendKeys(''); //empty for default

            element(by.css('.btn.btn-success')).click();

            expect(element(by.binding('message')).getText()).
                toEqual('An error occurred. The ad tag could not be created');
        });

        it('should create Ad Tag with Image Ad failed by invalid extension of imageUrl', function () {
            browser.get(browser.params.role + '/tagManagement/adTags/new');

            if (isAdmin()) {
                selectPublisher(0);
            }

            selectSite(0);
            selectAdSlot(0);
            selectAdNetwork(0);

            //Image Ad is selected
            selectImageAd();

            var name = getElementAsName();
            var imageUrl = getElementAsImageUrlForImageAd(); //for ImageAd only
            var targetUrl = getElementAsTargetUrlForImageAd(); //for ImageAd only

            name.sendKeys('adTag-test' + tagcadeTestUtil.getDateString(new Date()));
            imageUrl.sendKeys('http://www.imageAd.test/imageUrl.unknownExtension'); //for ImageAd only
            targetUrl.sendKeys('http://www.imageAd.test/targetUrl.jpg'); //for ImageAd only
            //position.sendKeys(''); //empty for default
            //rotation.sendKeys(''); //empty for default
            //frequencyCap.sendKeys(''); //empty for default

            element(by.css('.btn.btn-success')).click();

            expect(element(by.binding('message')).getText()).
                toEqual('An error occurred. The ad tag could not be created');
        });

        it('should create Ad Tag with Image Ad failed by invalid imageUrl', function () {
            browser.get(browser.params.role + '/tagManagement/adTags/new');

            if (isAdmin()) {
                selectPublisher(0);
            }

            selectSite(0);
            selectAdSlot(0);
            selectAdNetwork(0);

            //Image Ad is selected
            selectImageAd();

            var name = getElementAsName();
            var imageUrl = getElementAsImageUrlForImageAd(); //for ImageAd only
            var targetUrl = getElementAsTargetUrlForImageAd(); //for ImageAd only

            name.sendKeys('adTag-test' + tagcadeTestUtil.getDateString(new Date()));
            imageUrl.sendKeys('http://www.imageAd.test/imageUrl.jpg'); //for ImageAd only
            targetUrl.sendKeys('@@@.imageAd.test/targetUrl.jpg'); //for ImageAd only
            //position.sendKeys(''); //empty for default
            //rotation.sendKeys(''); //empty for default
            //frequencyCap.sendKeys(''); //empty for default

            element(by.css('.btn.btn-success')).click();

            expect(element(by.binding('message')).getText()).
                toEqual('An error occurred. The ad tag could not be created');
        });

        it('should create Ad Tag for AdSlot successfully', function () {
            browser.get(browser.params.role + '/tagManagement/adTags/new?adSlotId=' + browser.params.edit.adSlotId);

            var name = element(by.model('adTag.name'));
            var html = element(by.model('adTag.html'));
            var position = element(by.model('adTag.position'));
            var frequencyCap = element(by.model('adTag.frequencyCap'));

            name.clear();
            html.clear();
            position.clear();
            frequencyCap.clear();

            name.sendKeys('adTag-test' + tagcadeTestUtil.getDateString(new Date()));
            html.sendKeys('<h1>test</h1>>');
            position.sendKeys('100');
            frequencyCap.sendKeys('200');

            element(by.css('.btn.btn-success')).click();

            expect(element(by.binding('message')).getText()).
                toEqual('The ad tag has been updated');
        });

        it('should update Ad Tag successfully', function () {
            browser.get(browser.params.role + '/tagManagement/adTags/edit/' + browser.params.edit.adTagId);

            var name = element(by.model('adTag.name'));
            var html = element(by.model('adTag.html'));
            var position = element(by.model('adTag.position'));
            var frequencyCap = element(by.model('adTag.frequencyCap'));

            name.clear();
            html.clear();
            position.clear();
            frequencyCap.clear();

            name.sendKeys('adTag-test' + tagcadeTestUtil.getDateString(new Date()));
            html.sendKeys('<h1>test</h1>>');
            position.sendKeys('100');
            frequencyCap.sendKeys('200');

            element(by.css('.btn.btn-success')).click();

            expect(element(by.binding('message')).getText()).
                toEqual('The ad tag has been updated');
        });

        it('should update Ad Tag successfully by default values', function () {
            browser.get(browser.params.role + '/tagManagement/adTags/edit/' + browser.params.edit.adTagId);

            var name = element(by.model('adTag.name'));
            var html = element(by.model('adTag.html'));

            name.clear();
            html.clear();

            name.sendKeys('adTag-test' + tagcadeTestUtil.getDateString(new Date()));
            html.sendKeys('<h1>test</h1>>');
            //position.sendKeys(''); //empty for default
            //frequencyCap.sendKeys(''); //empty for default

            element(by.css('.btn.btn-success')).click();

            expect(element(by.binding('message')).getText()).
                toEqual('The ad tag has been updated');
        });

        it('should update Ad Tag by drag/drop successfully', function () {
            browser.get(browser.params.role + '/tagManagement/adTags/list/adslot/' + browser.params.edit.adSlotId);

            element(by.css('.ui-checkbox')).click();

            var getRow = function (num) {
                return element(by.repeater('adTags in adTagsGroup').row(num));
            };

            browser.driver.actions()
                .mouseDown(getRow(0))
                .mouseUp(getRow(1))
                .perform();

            expect(element(by.binding('message')).getText()).
                toEqual('The ad tags have been reordered');
        });

        function getElementAsName() {
            return element(by.model('adTag.name'));
        }

        function getElementAsHtml() {
            return element(by.model('adTag.html'));
            //return element(by.css('.CodeMirror.cm-s-default.CodeMirror-wrap'));
            //return element(by.id('inputHtml'));
            //return element(by.css('.CodeMirror-code'));
        }

        function getElementAsPosition() {
            return element(by.model('adTag.position'));
        }

        function getElementAsRotationWeight() {
            return element(by.model('adTag.rotation'));
        }

        function getElementAsFreqCap() {
            return element(by.model('adTag.frequencyCap'));
        }

        function getElementAsImageUrlForImageAd() {
            return element(by.model('adTag.descriptor.imageUrl'));
        }

        function getElementAsTargetUrlForImageAd() {
            return element(by.model('adTag.descriptor.targetUrl'));
        }

        function selectPublisher(rowId) {
            tagcadeTestUtil.selectItemByModel('selected.publisher', '.ui-select-choices-row-inner', rowId);
        }

        function selectSite(rowId) {
            tagcadeTestUtil.selectItemByModel('selected.site', '.ui-select-choices-row-inner', rowId);
        }

        function selectAdSlot(rowId) {
            tagcadeTestUtil.selectItemByModel('adTag.adSlot', '.ui-select-choices-row-inner', rowId);
        }

        function selectAdNetwork(rowId) {
            tagcadeTestUtil.selectItemByModel('adTag.adNetwork', '.ui-select-choices-row-inner', rowId);
        }

        function selectCustomAd() {
            element.all(by.css('.ui-radio')).then(function (items) {
                items[0].click();
            });
        }

        function selectImageAd() {
            element.all(by.css('.ui-radio')).then(function (items) {
                return items[1].click();
            });
        }
    });

    function isAdmin() {
        return userRole === 'admin';
    }
};