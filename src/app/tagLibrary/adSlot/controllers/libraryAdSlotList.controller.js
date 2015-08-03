(function() {
    'use strict';

    angular.module('tagcade.tagLibrary.adSlot')
        .controller('LibraryAdSlotList', LibraryAdSlotList)
    ;

    function LibraryAdSlotList($scope, $modal, $location, adSlots, AlertService, DisplayAdSlotLibrariesManager, NativeAdSlotLibrariesManager, DynamicAdSlotLibrariesManager, TYPE_AD_SLOT, AtSortableService, historyStorage, HISTORY_TYPE_PATH) {
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
            maxPages: 10,
            currentPage: $location.search().page - 1 || 0
        };
        $scope.adSlotTypes = TYPE_AD_SLOT;

        $scope.showPagination = showPagination;
        $scope.removeMoveToLibrary = removeMoveToLibrary;
        $scope.setCurrentPageForUrl = setCurrentPageForUrl;

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
                        var index = $scope.adSlots.indexOf(adSlot);

                        if (index > -1) {
                            $scope.adSlots.splice(index, 1);
                        }

                        adSlots = $scope.adSlots;

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

        function setCurrentPageForUrl() {
            AtSortableService.insertParamForUrl({page: $scope.tableConfig.currentPage + 1});
        }

        $scope.$on('$locationChangeSuccess', function() {
            $scope.tableConfig.currentPage = $location.search().page - 1;
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.adSlotLibrary)
        });
    }
})();