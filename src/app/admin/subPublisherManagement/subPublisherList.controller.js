(function () {
   'use strict';

    angular
        .module('tagcade.admin.subPublisher')
        .controller('SubPublisherList', SubPublisherList)
    ;

    function SubPublisherList($scope, $translate, subPublishers, subPublisherRestangular, AlertService, historyStorage, HISTORY_TYPE_PATH) {
        $scope.subPublishers = subPublishers;

        $scope.today = new Date();
        $scope.showPagination = showPagination;
        $scope.togglePublisherStatus = togglePublisherStatus;

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10
        };

        function togglePublisherStatus(publisher) {
            var newStatus = !publisher.enabled;
            var isPause = !newStatus;

            return subPublisherRestangular.one('subpublishers', publisher.id).patch({ 'enabled': newStatus })
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
            return angular.isArray($scope.subPublishers) && $scope.subPublishers.length > $scope.tableConfig.itemsPerPage;
        }

        $scope.$on('$locationChangeSuccess', function() {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.subPublishers)
        });
    }
})();