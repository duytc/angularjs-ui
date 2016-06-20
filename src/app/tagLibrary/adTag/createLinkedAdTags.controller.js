(function() {
    'use strict';

    angular.module('tagcade.tagLibrary.adTag')
        .controller('CreateLinkedAdTags', CreateLinkedAdTags)
    ;

    function CreateLinkedAdTags($scope, $translate, $state, $modalInstance, adTag, sites, SiteManager, AdTagLibrariesManager, AlertService, historyStorage, HISTORY_TYPE_PATH) {
        $scope.adTag = adTag;
        $scope.sites = sites;
        $scope.adSlots = [];

        $scope.selectData = {
            adSlots: []
        };

        $scope.isFormValid = isFormValid;
        $scope.submit = submit;
        $scope.selectSite = selectSite;

        function isFormValid() {
            return $scope.selectData.adSlots.length;
        }

        function selectSite(site) {
            SiteManager.one(site.id).getList('adslots')
                .then(function(adSlots) {
                    $scope.adSlots = [];

                    angular.forEach(adSlots.plain(), function(adSlot) {
                        if(adSlot.type != 'dynamic') {
                            $scope.adSlots.push({id: adSlot.id, name: adSlot.libraryAdSlot.name});
                        }
                    })
                })
        }

        function submit() {
            $modalInstance.close();

            var selectData = _refactorData();
            AdTagLibrariesManager.one($scope.adTag.id).customPOST(selectData, 'createlinks')
                .then(function() {
                    historyStorage.getLocationPath(HISTORY_TYPE_PATH.adTagLibrary, $state.current);

                    AlertService.addFlash({
                        type: 'success',
                        message: $translate.instant('AD_TAG_LIBRARY_MODULE.AD_TAG_FOR_AD_SLOT_SUCCESS')
                    });
                })
                .catch(function() {
                    AlertService.replaceAlerts({
                        type: 'error',
                        message: $translate.instant('AD_TAG_LIBRARY_MODULE.AD_TAG_FOR_AD_SLOT_FAIL')
                    });
                }
            );
        }

        function _refactorData() {
            var selectData = {
                adSlots: []
            };

            angular.forEach($scope.selectData.adSlots, function(adSlot) {
                selectData.adSlots.push(adSlot.id)
            });

            return selectData;
        }
    }
})();