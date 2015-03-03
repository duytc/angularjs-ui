(function () {
   'use strict';

    angular
        .module('tagcade.admin.publisherManagement')
        .controller('PublisherList', PublisherList)
    ;

    function PublisherList($scope, publishers, autoLogin, adminUserManager) {
        $scope.publishers = publishers;

        $scope.visitPublisher = visitPublisher;
        $scope.showPagination = showPagination;

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10
        };

        function visitPublisher(publisherId) {
            adminUserManager.one(publisherId).one('token').get()
                .then(function(tokenPublisher) {
                    autoLogin.switchToUser(tokenPublisher.plain(), 'app.publisher.dashboard');
                });
        }

        function showPagination() {
            return angular.isArray($scope.publishers) && $scope.publishers.length > $scope.tableConfig.itemsPerPage;
        }
    }
})();