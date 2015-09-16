(function() {
    'use strict';

    angular.module('tagcade.tagLibrary.adSlot')
        .controller('CreateLinkedAdSlots', CreateLinkedAdSlots)
    ;

    function CreateLinkedAdSlots($scope, $translate, $state, $modalInstance, adSlot, channels, sites, AdSlotLibrariesManager, AlertService, historyStorage, HISTORY_TYPE_PATH) {
        $scope.adSlot = adSlot;
        $scope.channels = channels;
        $scope.sites = sites;

        $scope.selectData = {
            channels: [],
            sites: []
        };

        $scope.isFormValid = isFormValid;
        $scope.submit = submit;

        function isFormValid() {
            return $scope.selectData.channels.length || $scope.selectData.sites.length;
        }

        function submit() {
            $modalInstance.close();

            var selectData = _refactorData();
            AdSlotLibrariesManager.one($scope.adSlot.id).customPOST(selectData, 'createlinks')
                .then(function() {
                    historyStorage.getLocationPath(HISTORY_TYPE_PATH.adSlotLibrary, $state.current);

                    AlertService.addFlash({
                        type: 'success',
                        message: $translate.instant('AD_SLOT_LIBRARY_MODULE.AD_SLOT_FOR_SITE_SUCCESS')
                    });
                })
                .catch(function() {
                    AlertService.replaceAlerts({
                        type: 'error',
                        message: $translate.instant('AD_SLOT_LIBRARY_MODULE.AD_SLOT_FOR_SITE_FAIL')
                    });
                }
            );
        }

        function _refactorData() {
            var selectData = {
                channels: [],
                sites: []
            };

            angular.forEach($scope.selectData.channels, function(channel) {
                selectData.channels.push(channel.id)
            });
            angular.forEach($scope.selectData.sites, function(site) {
                selectData.sites.push(site.id)
            });

            return selectData;
        }
    }
})();