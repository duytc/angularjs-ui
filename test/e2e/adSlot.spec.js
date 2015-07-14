exports.test = function () {
    describe("Ad Slots Test", function() {

        beforeEach(function () {
        });

        afterEach(function () {
            if (this.results_.failedCount > 0) {
                browser.quit();
            }
        });

        it('should list Ad Slots', function() {
            browser.get(browser.params.role + '/tagManagement/adSlots/list');

            expect(browser.getTitle()).
                toEqual('Ad Slots | Tagcade Platform');
        });
    });
};
