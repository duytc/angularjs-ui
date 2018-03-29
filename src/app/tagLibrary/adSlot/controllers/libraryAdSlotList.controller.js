(function() {
    'use strict';

    angular.module('tagcade.tagLibrary.adSlot')
        .controller('LibraryAdSlotList', LibraryAdSlotList)
    ;

    function LibraryAdSlotList($scope, $translate, $stateParams, $modal, Auth, adSlots, AlertService, ChannelManager, AdSlotLibrariesManager, DisplayAdSlotLibrariesManager, NativeAdSlotLibrariesManager, DynamicAdSlotLibrariesManager, TYPE_AD_SLOT, historyStorage, AtSortableService, HISTORY_TYPE_PATH, EVENT_ACTION_SORTABLE, SiteManager, RonAdSlotManager, ITEMS_PER_PAGE ) {

        $scope.itemsPerPageList = ITEMS_PER_PAGE;
        $scope.adSlots = adSlots.records;

        console.log('Ad slots:', $scope.adSlots);
        var params = {
            page: 1
        };

        $scope.hasData = function () {
            return !!adSlots.totalRecord;
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: $translate.instant('AD_SLOT_LIBRARY_MODULE.CURRENTLY_NO_AD_SLOT')
            });
        }

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10,
            totalItems: Number(adSlots.totalRecord)
        };

        $scope.availableOptions = {
            currentPage: $stateParams.page || 1,
            pageSize: 10
        };

        $scope.selectData = {
            query: $stateParams.searchKey || null
        };

        var getAdSlot;

        $scope.adSlotTypes = TYPE_AD_SLOT;
        $scope.demandSourceTransparency = Auth.getSession().demandSourceTransparency;

        $scope.showPagination = showPagination;
        $scope.removeMoveToLibrary = removeMoveToLibrary;
        $scope.createLinkedAdSlots = createLinkedAdSlots;
        $scope.createRonAdSlot = createRonAdSlot;
        $scope.changePage = changePage;
        $scope.searchData = searchData;
        $scope.changeItemsPerPage = changeItemsPerPage;

        function showPagination() {
            return angular.isArray($scope.adSlots) && adSlots.totalRecord > $scope.tableConfig.itemsPerPage;
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
                        _getAdSlot(params);

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
            var sites = SiteManager.one('nodeployments').getList(null, {slotLibrary: adSlot.id});
            var channels = ChannelManager.one('nodeployments').getList(null, {slotLibrary: adSlot.id});

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

        function changePage(currentPage) {
            params = angular.extend(params, {page: currentPage});
            _getAdSlot(params);
        }

        function searchData() {
            var query = {searchKey: $scope.selectData.query || ''};
            params = angular.extend(params, query);
            _getAdSlot(params, 500);
        }

        $scope.$on(EVENT_ACTION_SORTABLE, function(event, query) {
            params = angular.extend(params, query);
            _getAdSlot(params);
        });

        function _getAdSlot(query, ms) {
            params = query;

            clearTimeout(getAdSlot);

            getAdSlot = setTimeout(function() {
                params = query;
                return AdSlotLibrariesManager.one().get(query)
                    .then(function(adSlots) {
                        AtSortableService.insertParamForUrl(query);
                        $scope.adSlots = adSlots.records;
                        $scope.tableConfig.totalItems = Number(adSlots.totalRecord);
                        $scope.availableOptions.currentPage = Number(query.page);
                    });
            }, ms || 0);
        }

        function changeItemsPerPage()
        {
            var query = {limit: $scope.tableConfig.itemsPerPage || ''};
            params.page = 1;
            params = angular.extend(params, query);
            _getAdSlot(params, 500);
        }


        $scope.$on('$locationChangeSuccess', function() {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.adSlotLibrary)
        });
    }
})();