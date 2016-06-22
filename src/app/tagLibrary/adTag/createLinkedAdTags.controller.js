(function() {
    'use strict';

    angular.module('tagcade.tagLibrary.adTag')
        .controller('CreateLinkedAdTags', CreateLinkedAdTags)
    ;

    function CreateLinkedAdTags($scope, $translate, $state, $modalInstance, adTag, AdTagLibrariesManager, AdSlotManager, AlertService, historyStorage, HISTORY_TYPE_PATH) {
        $scope.adTag = adTag;
        $scope.adSlots = [];

        $scope.selectData = {
            adSlots: []
        };

        var totalRecord = null;
        var params = {
            query: ''
        };

        $scope.isFormValid = isFormValid;
        $scope.searchItem = searchItem;
        $scope.addMoreItems = addMoreItems;
        $scope.submit = submit;

        function isFormValid() {
            return $scope.selectData.adSlots.length;
        }

        function searchItem(query) {
            if(query == params.query) {
                return;
            }

            params.page = 1;
            params.query = query;
            params.searchKey = query;

            AdSlotManager.one('reportable').one('publisher', adTag.adNetwork.publisher.id).get(params)
                .then(function(data) {
                    totalRecord = data.totalRecord;
                    $scope.adSlots = data.records;
                });
        }

        function addMoreItems() {
            var page = Math.ceil(($scope.adSlots.length/10) + 1);

            if(params.page === page || (page > Math.ceil(totalRecord/10) && page != 1)) {
                return
            }

            params.page = page;

            AdSlotManager.one('reportable').one('publisher', adTag.adNetwork.publisher.id).get(params)
                .then(function(data) {
                    totalRecord = data.totalRecord;
                    angular.forEach(data.records, function(item) {
                        $scope.adSlots.push(item);
                    })
                });
        }

        function submit() {
            $modalInstance.close();

            AdTagLibrariesManager.one($scope.adTag.id).customPOST($scope.selectData, 'createlinks')
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

        $scope.$watch(function() {
            return $scope.selectData.adSlots
        }, function() {
            var condition = $scope.adSlots.length - $scope.selectData.adSlots.length;
            if(0 < condition && condition < 7 ) {
                addMoreItems();
            }
        })
    }
})();