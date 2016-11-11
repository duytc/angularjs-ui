(function () {
   'use strict';

    angular
        .module('tagcade.videoManagement.videoPublisher')
        .controller('VideoPublisherList', VideoPublisherList)
    ;

    function VideoPublisherList($scope, $translate, videoPublishers, VideoPublisherManager, AlertService, publisherRestangular, autoLogin, dateUtil, historyStorage, DIMENSIONS_OPTIONS_VIDEO_REPORT, HISTORY_TYPE_PATH) {
        $scope.videoPublishers = videoPublishers;

        $scope.today = new Date();
        $scope.showPagination = showPagination;
        $scope.visitPublisher = visitPublisher;
        $scope.togglePublisherStatus = togglePublisherStatus;
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

        function visitPublisher(publisherId) {
            publisherRestangular.one('videopublishers').one(publisherId.toString()).one('token').get()
                .then(function(tokenPublisher) {
                    autoLogin.switchToUser(tokenPublisher.plain(), 'app.videoPublisher.reports.unified.day'); //TODO
                });
        }

        function showPagination() {
            return angular.isArray($scope.videoPublishers) && $scope.videoPublishers.length > $scope.tableConfig.itemsPerPage;
        }

        $scope.$on('$locationChangeSuccess', function() {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.videoPublishers)
        });
    }
})();