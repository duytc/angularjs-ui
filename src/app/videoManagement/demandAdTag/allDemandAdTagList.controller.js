(function() {
    'use strict';

    angular.module('tagcade.videoManagement.demandAdTag')
        .controller('AllDemandAdTagList', AllDemandAdTagList)
    ;

    function AllDemandAdTagList($scope, $state, $translate, $modal, AlertService, demandAdTags, VideoDemandAdTagManager, AtSortableService, HISTORY_TYPE_PATH, DIMENSIONS_OPTIONS_VIDEO_REPORT, dateUtil, historyStorage) {
        $scope.demandAdTags = demandAdTags;
        $scope.listByLibrary = $state.params.listByLibrary;

        $scope.hasData = function () {
            return !!demandAdTags.length;
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: $translate.instant('AD_SOURCE_MODULE.CURRENTLY_NO_AD_SOURCE')
            });
        }

        $scope.showPagination = showPagination;
        $scope.confirmDeletion = confirmDeletion;
        $scope.toggleDemandAdTagStatus = toggleDemandAdTagStatus;
        $scope.paramsReport = paramsReport;

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10
        };

        function paramsReport(item) {
            var paramsReport = {
                filters: {
                    publisher: [],
                    demandPartner: [],
                    videoDemandAdTag: [item.id],
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

        function toggleDemandAdTagStatus(videoDemandAdTag, active) {
            var newTagStatus = active;

            VideoDemandAdTagManager.one(videoDemandAdTag.id).patch({'active': newTagStatus})
                .catch(function () {
                    AlertService.replaceAlerts({
                        type: 'error',
                        message: $translate.instant('AD_SOURCE_MODULE.CHANGE_STATUS_FAIL')
                    });

                    return $q.reject($translate.instant('AD_SOURCE_MODULE.CHANGE_STATUS_FAIL'));
                })
                .then(function () {
                    videoDemandAdTag.active = newTagStatus;
                })
            ;
        }

        function confirmDeletion(demandAdTag , index) {
            var modalInstance = $modal.open({
                templateUrl: 'videoManagement/demandAdTag/confirmDeletion.tpl.html'
            });

            modalInstance.result.then(function () {
                return VideoDemandAdTagManager.one(demandAdTag.id).remove()
                    .then(
                    function () {
                        var index = demandAdTags.indexOf(demandAdTag);

                        if (index > -1) {
                            demandAdTags.splice(index, 1);
                        }

                        $scope.demandAdTags = demandAdTags;

                        if($scope.tableConfig.currentPage > 0 && demandAdTags.length/10 == $scope.tableConfig.currentPage) {
                            AtSortableService.insertParamForUrl({page: $scope.tableConfig.currentPage});
                        }

                        AlertService.replaceAlerts({
                            type: 'success',
                            message: $translate.instant('AD_SOURCE_MODULE.DELETE_SUCCESS')
                        });
                    },
                    function () {
                        AlertService.replaceAlerts({
                            type: 'danger',
                            message:  $translate.instant('AD_SOURCE_MODULE.DELETE_FAIL')
                        });
                    }
                );
            });
        }

        function showPagination() {
            return angular.isArray($scope.demandAdTags) && $scope.demandAdTags.length > $scope.tableConfig.itemsPerPage;
        }

        $scope.$on('$locationChangeSuccess', function() {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.allVideoDemandAdTag)
        });
    }
})();