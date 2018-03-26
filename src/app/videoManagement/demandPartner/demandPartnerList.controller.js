(function() {
    'use strict';

    angular.module('tagcade.videoManagement.demandPartner')
        .controller('DemandPartnerList', DemandPartnerList)
    ;

    function DemandPartnerList($scope, $q, $stateParams ,$translate, $modal, AlertService, demandPartners, VideoDemandPartnerManager, AtSortableService, dateUtil, DIMENSIONS_OPTIONS_VIDEO_REPORT, HISTORY_TYPE_PATH, historyStorage, EVENT_ACTION_SORTABLE, ITEMS_PER_PAGE) {
        $scope.demandPartners = demandPartners.records;
        $scope.itemsPerPageList = ITEMS_PER_PAGE;

        $scope.hasData = function () {
            return !!$scope.demandPartners.length;
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: $translate.instant('VIDEO_DEMAND_PARTNER_MODULE.CURRENTLY_NO_DEMAND_PARTNER')
            });
        }

        var params = {
            page: 1
        };

        $scope.selectData = {
            query: $stateParams.searchKey || null
        };

        $scope.showPagination = showPagination;
        $scope.confirmDeletion = confirmDeletion;
        $scope.toggleDemandPartnerStatus = toggleDemandPartnerStatus;
        $scope.openListWaterfallForDemandAdTag = openListWaterfallForDemandAdTag;
        $scope.paramsReport = paramsReport;
        $scope.itemsPerPageList = ITEMS_PER_PAGE;
        $scope.changeItemsPerPage = changeItemsPerPage;


        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10,
            totalItems: Number(demandPartners.totalRecord)
        };

        $scope.availableOptions = {
            currentPage: $stateParams.page || 1,
            pageSize: 10
        };

        $scope.changePage = changePage;
        $scope.searchData = searchData;

        $scope.$on(EVENT_ACTION_SORTABLE, function(event, query) {
            params = angular.extend(params, query);
            _getDemandPartners(params);
        });

        function changePage(currentPage) {
            params = angular.extend(params, {page: currentPage});
            _getDemandPartners(params);
        }

        function searchData() {
            var query = {searchKey: $scope.selectData.query || ''};
            params = angular.extend(params, query);
            _getDemandPartners(params, 500);
        }

        var getDemandPartners;
        function _getDemandPartners(query, ms) {
            params = query;

            clearTimeout(getDemandPartners);

            getDemandPartners = setTimeout(function() {
                params = query;
                return VideoDemandPartnerManager.one().get(query)
                    .then(function(demandPartners) {
                        AtSortableService.insertParamForUrl(query);
                        $scope.demandPartners = demandPartners.records;
                        $scope.tableConfig.totalItems = Number(demandPartners.totalRecord);
                        $scope.availableOptions.currentPage = Number(query.page);
                    });
            }, ms || 0);
        }

        function paramsReport(item) {
            var paramsReport = {
                filters: {
                    publisher: [],
                    demandPartner: [item.id],
                    videoDemandAdTag: [],
                    videoPublisher: [],
                    waterfallTag: [],
                    startDate: dateUtil.getFormattedDate(new Date()),
                    endDate: dateUtil.getFormattedDate(new Date())
                },
                metrics: [],
                breakdowns: ['day']
            };

            angular.forEach(DIMENSIONS_OPTIONS_VIDEO_REPORT, function (metric) {
                paramsReport.metrics.push(metric.key)
            });

            paramsReport.filters = angular.toJson(paramsReport.filters);
            paramsReport.metrics = angular.toJson(paramsReport.metrics);
            paramsReport.breakdowns = angular.toJson(paramsReport.breakdowns);

            return paramsReport;
        }

        function openListWaterfallForDemandAdTag(demandPartner) {

            VideoDemandPartnerManager.one(demandPartner.id).one('waterfalltags').get()
                .then(function(data) {
                    var waterfalls = data.plain();

                    if(!waterfalls.length) {
                        AlertService.replaceAlerts({
                            type: 'warning',
                            message: $translate.instant('VIDEO_DEMAND_PARTNER_MODULE.CURRENTLY_NO_WATERFALLS_DEMAND_PARTNER', {demand_partner_name: adNetwork.name})
                        });

                        return;
                    }

                    $modal.open({
                        templateUrl: 'videoManagement/demandPartner/waterfallsForDemandPartner.tpl.html',
                        size: 'lg',
                        controller: 'WaterfallsForDemandPartner',
                        resolve: {
                            waterfalls: function () {
                                return waterfalls;
                            },
                            demandPartner: function() {
                                return demandPartner;
                            }
                        }
                    });

                });
        }
        function confirmDeletion(demandPartner, index) {
            var modalInstance = $modal.open({
                templateUrl: 'videoManagement/demandPartner/confirmDeletion.tpl.html'
            });

            modalInstance.result.then(function () {
                return VideoDemandPartnerManager.one(demandPartner.id).remove()
                    .then(
                    function () {
                        var index = demandPartners.indexOf(demandPartner);

                        if (index > -1) {
                            demandPartners.splice(index, 1);
                        }

                        $scope.demandPartners = demandPartners;

                        if($scope.tableConfig.currentPage > 0 && demandPartners.length/10 == $scope.tableConfig.currentPage) {
                            AtSortableService.insertParamForUrl({page: $scope.tableConfig.currentPage});
                        }

                        AlertService.replaceAlerts({
                            type: 'success',
                            message: $translate.instant('VIDEO_DEMAND_PARTNER_MODULE.DELETE_SUCCESS')
                        });
                    },
                    function () {
                        AlertService.replaceAlerts({
                            type: 'danger',
                            message:  $translate.instant('VIDEO_DEMAND_PARTNER_MODULE.DELETE_FAIL')
                        });
                    }
                )
                    ;
            });
        }

        function showPagination() {
            return angular.isArray($scope.demandPartners) && $scope.tableConfig.totalItems > $scope.tableConfig.itemsPerPage;
        }

        function  toggleDemandPartnerStatus(demandPartner, newStatus) {
            //var newStatus = !adNetwork.active;

            var isPause = !newStatus;

            var dfd = $q.defer();

            dfd.promise
                .then(function () {
                        var checked = newStatus ? 1 : 0;

                        return VideoDemandPartnerManager.one(demandPartner.id).customPUT({ 'active': checked }, 'status')
                            .catch(function () {
                                AlertService.replaceAlerts({
                                    type: 'error',
                                    message: $translate.instant('VIDEO_DEMAND_PARTNER_MODULE.UPDATE_STATUS_FAIL')
                                });

                                return $q.reject($translate.instant('VIDEO_DEMAND_PARTNER_MODULE.UPDATE_STATUS_FAIL'));
                            })
                            .then(function () {
                                if(newStatus) {
                                    demandPartner.activeAdTagsCount += demandPartner.pausedAdTagsCount;
                                    demandPartner.pausedAdTagsCount = 0;
                                } else {
                                    demandPartner.pausedAdTagsCount += demandPartner.activeAdTagsCount;
                                    demandPartner.activeAdTagsCount = 0;
                                }

                                var successMessage;

                                if (isPause) {
                                    successMessage = $translate.instant('VIDEO_DEMAND_PARTNER_MODULE.PAUSE_STATUS_SUCCESS');
                                } else {
                                    successMessage = $translate.instant('VIDEO_DEMAND_PARTNER_MODULE.ACTIVE_STATUS_SUCCESS');
                                }

                                AlertService.replaceAlerts({
                                    type: 'success',
                                    message: successMessage
                                });
                            })
                            ;
                    }
                );

            if (isPause) {
                var modalInstance = $modal.open({
                    templateUrl: 'videoManagement/demandPartner/confirmPause.tpl.html'
                });

                modalInstance.result.then(function () {
                    dfd.resolve();
                });
            } else {
                // if it is not a pause, proceed without a modal
                dfd.resolve();
            }
        }

        function changeItemsPerPage()
        {
            var query = {limit: $scope.tableConfig.itemsPerPage || ''};
            params = angular.extend(params, query);
            _getDemandPartners(params, 500);
        }

        $scope.$on('$locationChangeSuccess', function() {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.demandPartner)
        });
    }
})();