(function() {
    'use strict';

    angular.module('tagcade.tagLibrary.adSlot')
        .controller('LibraryAdSlotList', LibraryAdSlotList)
    ;

    function LibraryAdSlotList($scope, $modal, adSlots, AlertService, DisplayAdSlotLibrariesManager, NativeAdSlotLibrariesManager, DynamicAdSlotLibrariesManager, TYPE_AD_SLOT, AtSortableService, historyStorage, HISTORY_TYPE_PATH) {
        $scope.adSlots = adSlots;

        $scope.hasData = function () {
            return !!adSlots.length;
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: 'There is currently no ad slots in the library'
            });
        }

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10
        };
        $scope.adSlotTypes = TYPE_AD_SLOT;

        $scope.showPagination = showPagination;
        $scope.removeMoveToLibrary = removeMoveToLibrary;

        function showPagination() {
            return angular.isArray($scope.adSlots) && $scope.adSlots.length > $scope.tableConfig.itemsPerPage;
        }

        function removeMoveToLibrary(adSlot) {
            var modalInstance = $modal.open({
                templateUrl: 'tagManagement/adSlot/confirmDeletion.tpl.html'
            });

            modalInstance.result.then(function () {
                var Manager;

                if(adSlot.libType == $scope.adSlotTypes.display)  {
                    Manager = DisplayAdSlotLibrariesManager;
                }
                if(adSlot.libType == $scope.adSlotTypes.native) {
                    Manager = NativeAdSlotLibrariesManager;
                }
                if(adSlot.libType == $scope.adSlotTypes.dynamic) {
                    Manager = DynamicAdSlotLibrariesManager;
                }

                return Manager.one(adSlot.id).remove()
                    .then(function () {
                        var index = adSlots.indexOf(adSlot);

                        if (index > -1) {
                            adSlots.splice(index, 1);
                        }

                        $scope.adSlots = adSlots;

                        if($scope.tableConfig.currentPage > 0 && adSlots.length/10 == $scope.tableConfig.currentPage) {
                            AtSortableService.insertParamForUrl({page: $scope.tableConfig.currentPage});
                        }

                        AlertService.replaceAlerts({
                            type: 'success',
                            message: 'Remove ad slot from library successfully'
                        });
                    })
                    .catch(function (status) {
                        var message;

                        if(!!status && !!status.data && !!status.data.message) {
                            message = status.data.message
                        }
                        else {
                            message = 'Could not remove ad slot from library'
                        }

                        AlertService.replaceAlerts({
                            type: 'error',
                            message: message
                        });
                    })
                    ;
            });
        }

        $scope.$on('$locationChangeSuccess', function() {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.adSlotLibrary)
        });
    }
})();