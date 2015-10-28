(function() {
    'use strict';

    angular.module('tagcade.tagLibrary.adSlot')
        .controller('LibraryAdSlotList', LibraryAdSlotList)
    ;

    function LibraryAdSlotList($scope, $translate, $modal, adSlots, AlertService, ChannelManager, DisplayAdSlotLibrariesManager, NativeAdSlotLibrariesManager, DynamicAdSlotLibrariesManager, TYPE_AD_SLOT, AtSortableService, historyStorage, HISTORY_TYPE_PATH, SiteManager, RonAdSlotManager) {
        $scope.adSlots = adSlots;

        $scope.hasData = function () {
            return !!adSlots.length;
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: $translate.instant('AD_SLOT_LIBRARY_MODULE.CURRENTLY_NO_AD_SLOT')
            });
        }

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10
        };
        $scope.adSlotTypes = TYPE_AD_SLOT;

        $scope.showPagination = showPagination;
        $scope.removeMoveToLibrary = removeMoveToLibrary;
        $scope.createLinkedAdSlots = createLinkedAdSlots;
        $scope.createRonAdSlot = createRonAdSlot;

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
                            message:  $translate.instant('AD_SLOT_LIBRARY_MODULE.REMOVE_SUCCESS')
                        });
                    })
                    .catch(function (status) {
                        var message;

                        if(!!status && !!status.data && !!status.data.message) {
                            message = status.data.message
                        }
                        else {
                            message = $translate.instant('AD_SLOT_LIBRARY_MODULE.REMOVE_FAIL')
                        }

                        AlertService.replaceAlerts({
                            type: 'error',
                            message: message
                        });
                    })
                    ;
            });
        }

        function createLinkedAdSlots(adSlot) {
            var sites = SiteManager.one('noreference').getList(null, {slotLibrary: adSlot.id});
            var channels = ChannelManager.one('noreference').getList(null, {slotLibrary: adSlot.id});

            channels.then(function(channels) {
                sites.then(function(sites) {
                    if(!!channels.length || !!sites.length) {
                        $modal.open({
                            templateUrl: 'tagLibrary/adSlot/views/createLinkedAdSlots.tpl.html',
                            size: 'lg',
                            controller: 'CreateLinkedAdSlots',
                            resolve: {
                                adSlot: function () {
                                    return adSlot;
                                },
                                channels: function() {
                                    return channels
                                },
                                sites: function() {
                                    return sites
                                }
                            }
                        });
                    }
                    else {
                        AlertService.replaceAlerts({
                            type: 'warning',
                            message: $translate.instant('AD_SLOT_LIBRARY_MODULE.ALERT_CREATE_LINKED_AD_SLOTS_FULL_SITE')
                        });
                    }
                });
            });
        }

        function createRonAdSlot(adSlotLibrary, ronAdSlotId) {
            var modalInstance = $modal.open({
                templateUrl: 'tagLibrary/adSlot/views/createRonAdSlotForAdSlot.tpl.html',
                size: 'lg',
                controller: 'CreateRonAdSlotForAdSlots',
                resolve: {
                    adSlotLib: function(){
                        return adSlotLibrary;
                    },
                    ronAdSlot: function() {
                        if(!!ronAdSlotId) {
                            return RonAdSlotManager.one(ronAdSlotId).get()
                        }

                        return null;
                    },
                    segments: function(SegmentManager){
                        return SegmentManager.getList();
                    }
                }
            });

            modalInstance.result.then(function(){

            });
        }

        $scope.$on('$locationChangeSuccess', function() {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.adSlotLibrary)
        });
    }
})();