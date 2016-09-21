(function() {
    'use strict';

    angular.module('tagcade.videoManagement.demandPartner')
        .controller('DemandPartnerList', DemandPartnerList)
    ;

    function DemandPartnerList($scope, $q, $translate, $modal, AlertService, demandPartners, VideoDemandPartnerManager, AtSortableService, dateUtil, DIMENSIONS_OPTIONS_VIDEO_REPORT, HISTORY_TYPE_PATH, historyStorage) {
        $scope.demandPartners = demandPartners;

        $scope.hasData = function () {
            return !!demandPartners.length;
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: $translate.instant('VIDEO_DEMAND_PARTNER_MODULE.CURRENTLY_NO_DEMAND_PARTNER')
            });
        }

        $scope.showPagination = showPagination;
        $scope.confirmDeletion = confirmDeletion;
        $scope.toggleDemandPartnerStatus = toggleDemandPartnerStatus;
        $scope.openListWaterfallForDemandAdTag = openListWaterfallForDemandAdTag;
        $scope.paramsReport = paramsReport;

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10
        };

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
                        AlertService.addAlert({
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
            return angular.isArray($scope.demandPartners) && $scope.demandPartners.length > $scope.tableConfig.itemsPerPage;
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

        $scope.$on('$locationChangeSuccess', function() {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.demandPartner)
        });
    }
})();