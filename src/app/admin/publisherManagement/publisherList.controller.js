(function () {
   'use strict';

    angular
        .module('tagcade.admin.publisherManagement')
        .controller('PublisherList', PublisherList)
    ;

    function PublisherList($scope, $translate, publishers, autoLogin, adminUserManager, AlertService, historyStorage, HISTORY_TYPE_PATH, ITEMS_PER_PAGE ) {
        $scope.publishers = publishers;

        $scope.itemsPerPageList = ITEMS_PER_PAGE;
        $scope.today = new Date();
        $scope.visitPublisher = visitPublisher;
        $scope.showPagination = showPagination;
        $scope.togglePublisherStatus = togglePublisherStatus;

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10
        };

        function togglePublisherStatus(publisher) {
            var newStatus = !publisher.enabled;
            var isPause = !newStatus;

            return adminUserManager.one(publisher.id).patch({ 'enabled': newStatus })
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
            adminUserManager.one(publisherId).one('token').get()
                .then(function(tokenPublisher) {
                    autoLogin.switchToUser(tokenPublisher.plain(), 'app.publisher.dashboard');
                });
        }

        function showPagination() {
            return angular.isArray($scope.publishers) && $scope.publishers.length > $scope.tableConfig.itemsPerPage;
        }

        $scope.$on('$locationChangeSuccess', function() {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.publisher)
        });
    }
})();