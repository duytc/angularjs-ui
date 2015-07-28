(function() {
    'use strict';

    angular.module('tagcade.tagLibrary.adSlot')
        .controller('LibraryAdSlotList', LibraryAdSlotList)
    ;

    function LibraryAdSlotList($scope, $modal, $location, adSlots, AlertService, DisplayAdSlotLibrariesManager, NativeAdSlotLibrariesManager, DynamicAdSlotLibrariesManager, TYPE_AD_SLOT, AtSortableService, historyStorage, HISTORY_TYPE_PATH, LIBRARY_AD_SLOT_TYPE) {
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
        $scope.libraryAdSlotTypes = LIBRARY_AD_SLOT_TYPE;

        $scope.showPagination = showPagination;
        $scope.removeMoveToLibrary = removeMoveToLibrary;
        $scope.setCurrentPageForUrl = setCurrentPageForUrl;
        $scope.showLibraryAdSlotType = showLibraryAdSlotType;

        function showPagination() {
            return angular.isArray($scope.adSlots) && $scope.adSlots.length > $scope.tableConfig.itemsPerPage;
        }

        function removeMoveToLibrary(adSlot, type) {
            var modalInstance = $modal.open({
                templateUrl: 'tagManagement/adSlot/confirmDeletion.tpl.html'
            });

            modalInstance.result.then(function () {
                var newVisible = !adSlot.visible;
                var Manager;

                if(type == $scope.libraryAdSlotTypes.display)  {
                    Manager = DisplayAdSlotLibrariesManager;
                }
                if(type == $scope.libraryAdSlotTypes.native) {
                    Manager = NativeAdSlotLibrariesManager;
                }
                if(type == $scope.libraryAdSlotTypes.dynamic) {
                    Manager = DynamicAdSlotLibrariesManager;
                }

                var removeAdSlot;

                if(adSlot.isReferenced) {
                    removeAdSlot = Manager.one(adSlot.id).patch({visible: newVisible})
                } else {
                    removeAdSlot = Manager.one(adSlot.id).remove()
                }

                return removeAdSlot
                    .then(function () {
                        var index = $scope.adSlots.indexOf(adSlot);

                        if (index > -1) {
                            $scope.adSlots.splice(index, 1);
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

        function setCurrentPageForUrl() {
            AtSortableService.insertParamForUrl({page: $scope.tableConfig.currentPage + 1});
        }

        function showLibraryAdSlotType(type) {
            if(type == $scope.libraryAdSlotTypes.display) {
                return 'display';
            }
            if(type == $scope.libraryAdSlotTypes.native) {
                return 'native';
            }
            if(type == $scope.libraryAdSlotTypes.dynamic) {
                return 'dynamic';
            }

            return null;
        }

        $scope.$on('$locationChangeSuccess', function() {
            $scope.tableConfig.currentPage = $location.search().page - 1;
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.adSlotLibrary)
        });
    }
})();