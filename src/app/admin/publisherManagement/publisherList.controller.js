(function () {
   'use strict';

    angular
        .module('tagcade.admin.publisherManagement')
        .controller('PublisherList', PublisherList)
    ;

    function PublisherList($scope, publishers) {
        $scope.publishers = publishers;

        $scope.showPagination = showPagination;

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10
        };

        function showPagination() {
            return angular.isArray($scope.publishers) && $scope.publishers.length > $scope.tableConfig.itemsPerPage;
        }
    }
})();