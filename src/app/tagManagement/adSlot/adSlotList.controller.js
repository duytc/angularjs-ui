(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adSlot')
        .controller('AdSlotList', AdSlotList)
    ;

    function AdSlotList($scope, $translate, $state, $stateParams, $modal, Auth, AlertService, adSlotService, SiteManager, adSlots, site, AdSlotManager, AtSortableService, libraryAdSlotService, historyStorage, HISTORY_TYPE_PATH, TYPE_AD_SLOT, EVENT_ACTION_SORTABLE, ITEMS_PER_PAGE) {
        $scope.site = site;
        $scope.itemsPerPageList = ITEMS_PER_PAGE;
        $scope.adSlots = adSlots.records;
        $scope.adSlotTypes = TYPE_AD_SLOT;

        $scope.smartAdSlots = [];
        $scope.standaloneAdSlots = [];
        $scope.isChannel = angular.isArray(adSlots.records) && adSlots.totalRecord > 0 && angular.isObject(adSlots.records[0].channels);
        $scope.demandSourceTransparency = Auth.getSession().demandSourceTransparency;

        var params = {
            page: 1
        };

        AlertService.clearAll ();

        $scope.hasData = function () {
            return $scope.adSlots.length;
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: $translate.instant('AD_SLOT_MODULE.CURRENTLY_NO_AD_SLOT')
            });
        }

        $scope.today = new Date();
        $scope.allAdSlot = !$stateParams.siteId;
        $scope.currentSiteId = $stateParams.siteId || null;

        $scope.showPagination = showPagination;
        $scope.backToListSite = backToListSite;
        $scope.exist = exist;
        $scope.shareAdSlot = shareAdSlot;
        $scope.unLinkAdSlot = unLinkAdSlot;
        $scope.changePage = changePage;
        $scope.searchData = searchData;
        $scope.changeItemsPerPage = changeItemsPerPage;
        $scope.changePage = changePage;
        $scope.addAdSlotToOptimizationRule = addAdSlotToOptimizationRule;

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

        $scope.generateAdTag = function (adSlot) {
            var Manager = adSlotService.getManagerForAdSlot(adSlot);

            $modal.open({
                templateUrl: 'tagManagement/adSlot/generateAdTag.tpl.html',
                resolve: {
                    javascriptTag: function () {
                        return Manager.one(adSlot.id).customGET('jstag');
                    }
                },
                controller: function ($scope, javascriptTag, USER_MODULES) {
                    $scope.selected = {
                        secure: false
                    };

                    $scope.adSlotName = adSlot.libraryAdSlot.name;
                    $scope.javascriptTag = javascriptTag;
                    $scope.getTextToCopy = function(string) {
                        return string.replace(/\n/g, '\r\n');
                    };

                    $scope.hasDisplayAdsModuleAndSecure = function () {
                        return adSlot.site.publisher.enabledModules.indexOf(USER_MODULES.displayAds) > -1 && ((!!adSlot.site.publisher.tagDomain && adSlot.site.publisher.tagDomain.length == 0) || !adSlot.site.publisher.tagDomain || !!adSlot.site.publisher.tagDomain.secure)
                    };

                    $scope.secureChange = function(secure) {
                        Manager.one(adSlot.id).customGET('jstag', {forceSecure: secure})
                            .then(function(javascriptTag) {
                                $scope.javascriptTag = javascriptTag;
                            });
                    }
                }
            });
        };

        $scope.confirmDeletion = function (adSlot) {
            var modalInstance = $modal.open({
                templateUrl: 'tagManagement/adSlot/confirmDeletion.tpl.html'
            });

            var Manager = adSlotService.getManagerForAdSlot(adSlot);

            modalInstance.result.then(function () {
                return Manager.one(adSlot.id).remove()
                    .then(
                        function () {
                            if(angular.isArray(adSlots)) {
                                var index = adSlots.indexOf(adSlot);

                                if (index > -1) {
                                    adSlots.splice(index, 1);
                                }

                                $scope.adSlots = adSlots;

                                if($scope.tableConfig.currentPage > 0 && adSlots.length/10 == $scope.tableConfig.currentPage) {
                                    AtSortableService.insertParamForUrl({page: $scope.tableConfig.currentPage});
                                }
                            } else {
                                _getAdSlot(params);
                            }

                            AlertService.replaceAlerts({
                                type: 'success',
                                message: $translate.instant('AD_SLOT_MODULE.DELETE_SUCCESS')
                            });
                        },
                        function (status) {
                            var message;

                            if(!!status && !!status.data && !!status.data.message) {
                                message = status.data.message
                            }
                            else {
                                message = $translate.instant('AD_SLOT_MODULE.DELETE_FAIL')
                            }

                            AlertService.replaceAlerts({
                                type: 'danger',
                                message: message
                            });
                        }
                    )
                ;
            });
        };

        function addAdSlotToOptimizationRule(adSlot) {
            var modalInstance = $modal.open({
                templateUrl: 'tagManagement/adSlot/addAdSlotToOptimizationRule.tpl.html',
                size: 'lg',
                controller: 'AddAdSlotToOptimizationRule',
                resolve: {
                    adSlot: function () {
                        return adSlot;
                    },
                    optimizationRules: function (AutoOptimizationManager) {
                        return AutoOptimizationManager.getList({publisher: adSlot.site.publisher.id})
                            .then(function (optimizationRules) {
                                return optimizationRules.plain();
                            })
                    }
                },
                ncyBreadcrumb: {
                    label: 'Add To Optimization Rule - {{ adSlot.libraryAdSlot.name }}'
                }
            });

            modalInstance.result.then(function () {
                // do nothing...
            });
        }

        $scope.cloneAdSlot = function(adSlot) {
            $modal.open({
                templateUrl: 'tagManagement/adSlot/cloneAdSlot.tpl.html',
                size: 'lg',
                controller: 'CloneAdSlot',
                resolve: {
                    adSlot: function () {
                        return adSlot;
                    },
                    Manager: function() {
                        return adSlotService.getManagerForAdSlot(adSlot);
                    }
                }
            });
        };

        function showPagination() {
            if(angular.isArray(adSlots)) {
                return $scope.adSlots.length > $scope.tableConfig.itemsPerPage;
            }

            return angular.isArray($scope.adSlots) && adSlots.totalRecord > $scope.tableConfig.itemsPerPage;
        }

        function backToListSite() {
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.site, '^.^.sites.list');
        }

        function exist(type, typeCompare) {
            if(type == typeCompare) {
                return true;
            }

            return false;
        }

        function shareAdSlot(adSlot) {
            var libraryAdSlot = {
                visible: true
            };

            var Manager = libraryAdSlotService.getManagerForAdSlotLibrary(adSlot);
            Manager.one(adSlot.libraryAdSlot.id).patch(libraryAdSlot)
                .then(function () {
                    historyStorage.getLocationPath(HISTORY_TYPE_PATH.adSlot, $state.current);

                    AlertService.addFlash({
                        type: 'success',
                        message: $translate.instant('AD_SLOT_MODULE.MOVED_TO_LIBRARY_SUCCESS')
                    });
                })
                .catch(function () {
                    AlertService.replaceAlerts({
                        type: 'error',
                        message: $translate.instant('AD_SLOT_MODULE.MOVED_TO_LIBRARY_FAIL')
                    });
                })
            ;
        }

        function unLinkAdSlot(adSlot) {
            var Manager = AdSlotManager.one(adSlot.id).one('unlink').patch();
            Manager
                .then(function () {
                    adSlot.libraryAdSlot.visible = false;

                    AlertService.replaceAlerts({
                        type: 'success',
                        message: $translate.instant('AD_SLOT_MODULE.UNLINK_SUCCESS')
                    });
                })
                .catch(function () {
                    AlertService.replaceAlerts({
                        type: 'error',
                        message: $translate.instant('AD_SLOT_MODULE.UNLINK_FAIL')
                    });
                })
            ;
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

        function changeItemsPerPage()
        {
            var query = {limit: $scope.tableConfig.itemsPerPage || ''};
            params.page = 1;
            params = angular.extend(params, query);
            _getAdSlot(params, 500);
        }

        function changePage(currentPage) {
            params = angular.extend(params, {page: currentPage});
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
                var Manager = null;

                if(!!$scope.site) {
                    Manager = SiteManager.one($stateParams.siteId).one('adslots').get(query)
                } else {
                    Manager = $scope.isChannel ? AdSlotManager.one('relatedchannel').get(query) : AdSlotManager.one().get(query)
                }

                params = query;
                return Manager
                    .then(function(adSlots) {
                        AtSortableService.insertParamForUrl(query);
                        $scope.adSlots = adSlots.records;
                        $scope.tableConfig.totalItems = Number(adSlots.totalRecord);
                        $scope.availableOptions.currentPage = Number(query.page);
                    });
            }, ms || 0);
        }

        $scope.$on('$locationChangeSuccess', function() {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.adSlot)
        });
    }
})();