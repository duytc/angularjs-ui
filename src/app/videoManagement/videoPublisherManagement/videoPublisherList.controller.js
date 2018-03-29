(function () {
   'use strict';

    angular
        .module('tagcade.videoManagement.videoPublisher')
        .controller('VideoPublisherList', VideoPublisherList)
    ;

    function VideoPublisherList($scope, $translate, $stateParams, AtSortableService, videoPublishers, VideoPublisherManager, AlertService, dateUtil, historyStorage, DIMENSIONS_OPTIONS_VIDEO_REPORT, HISTORY_TYPE_PATH, EVENT_ACTION_SORTABLE, ITEMS_PER_PAGE) {

        $scope.videoPublishers = videoPublishers.records;
        $scope.today = new Date();
        $scope.showPagination = showPagination;
        $scope.togglePublisherStatus = togglePublisherStatus;
        $scope.paramsReport = paramsReport;

        $scope.itemsPerPageList = ITEMS_PER_PAGE;
        $scope.changeItemsPerPage = changeItemsPerPage;

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10,
            totalItems: Number(videoPublishers.totalRecord)
        };

        $scope.availableOptions = {
            currentPage: $stateParams.page || 1,
            pageSize: 10
        };

        var params = {
            page: 1
        };

        $scope.selectData = {
            query: $stateParams.searchKey || null
        };

        $scope.changePage = changePage;
        $scope.searchData = searchData;

        $scope.$on(EVENT_ACTION_SORTABLE, function(event, query) {
            params = angular.extend(params, query);
            _getVideoPublishers(params);
        });

        function changePage(currentPage) {
            params = angular.extend(params, {page: currentPage});
            _getVideoPublishers(params);
        }

        function searchData() {
            var query = {searchKey: $scope.selectData.query || ''};
            params = angular.extend(params, query);
            _getVideoPublishers(params, 500);
        }

        var getVideoPublishers;
        function _getVideoPublishers(query, ms) {
            params = query;

            clearTimeout(getVideoPublishers);

            getVideoPublishers = setTimeout(function() {
                params = query;
                return VideoPublisherManager.one().get(query)
                    .then(function(videoPublishers) {
                        AtSortableService.insertParamForUrl(query);
                        $scope.videoPublishers = videoPublishers.records;
                        $scope.tableConfig.totalItems = Number(videoPublishers.totalRecord);
                        $scope.availableOptions.currentPage = Number(query.page);
                    });
            }, ms || 0);
        }

        function paramsReport(item) {
            var paramsReport = {
                filters: {
                    publisher: [],
                    demandPartner: [],
                    videoDemandAdTag: [],
                    videoPublisher: [item.id],
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

        function togglePublisherStatus(publisher) {
            var newStatus = !publisher.enabled;
            var isPause = !newStatus;

            return VideoPublisherManager.one('videopublishers', publisher.id).patch({ 'enabled': newStatus })
                .then(function () {
                    publisher.enabled = newStatus;

                    var successMessage;

                    if (isPause) {
                        successMessage = $translate.instant('PUBLISHER_MODULE.PAUSE_STATUS_SUCCESS');
                    } else {
                        successMessage = $translate.instant('PUBLISHER_MODULE.ACTIVE_STATUS_SUCCESS');
                    }

                    AlertService.replaceAlerts({
                        type: 'success',
                        message: successMessage
                    });
                })
                .catch(function () {
                    AlertService.replaceAlerts({
                        type: 'error',
                        message: $translate.instant('PUBLISHER_MODULE.UPDATE_STATUS_FAIL')
                    });
                })
                ;
        }

        function showPagination() {
            return angular.isArray($scope.videoPublishers) && $scope.tableConfig.totalItems > $scope.tableConfig.itemsPerPage;
        }

        function changeItemsPerPage()
        {
            var query = {limit: $scope.tableConfig.itemsPerPage || ''};
            params.page = 1;
            params = angular.extend(params, query);
            _getVideoPublishers(params, 500);
        }

        $scope.$on('$locationChangeSuccess', function() {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.videoPublisher)
        });
    }
})();