(function () {
   'use strict';

    angular
        .module('tagcade.admin.publisherManagement')
        .controller('PublisherList', PublisherList)
    ;

    function PublisherList($scope, publishers, $location, autoLogin, adminUserManager, AtSortableService, historyStorage, HISTORY_TYPE_PATH) {
        $scope.publishers = publishers;

        $scope.visitPublisher = visitPublisher;
        $scope.showPagination = showPagination;
        $scope.setCurrentPageForUrl = setCurrentPageForUrl;

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10,
            currentPage: $location.search().page - 1 || 0
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

        function setCurrentPageForUrl() {
            AtSortableService.insertParamForUrl({page: $scope.tableConfig.currentPage + 1});
        }

        $scope.$on('$locationChangeSuccess', function() {
            $scope.tableConfig.currentPage = $location.search().page - 1;
            historyStorage.setLocationPath(HISTORY_TYPE_PATH.publisher)
        });
    }
})();