(function () {
   'use strict';

    angular
        .module('tagcade.admin.publisherManagement')
        .controller('PublisherList', PublisherList)
    ;

    function PublisherList($scope, publishers, autoLogin, adminUserManager, AlertService, historyStorage, HISTORY_TYPE_PATH) {
        $scope.publishers = publishers;

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
                        successMessage = 'The publisher has been deactivated';
                    } else {
                        successMessage = 'The publisher has been activated';
                    }

                    AlertService.replaceAlerts({
                        type: 'success',
                        message: successMessage
                    });
                })
                .catch(function () {
                    AlertService.replaceAlerts({
                        type: 'error',
                        message: 'Could not change publisher status'
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