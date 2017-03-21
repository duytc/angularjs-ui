(function() {
    'use strict';

    angular.module('tagcade.tagManagement.domainList')
        .controller('BlockList', BlockList)
    ;

    function BlockList($scope, $translate, $modal, AlertService, domainList, adNetwork, BlockListManager, AtSortableService, HISTORY_TYPE_PATH, historyStorage) {
        $scope.domainList = domainList;
        $scope.adNetwork = adNetwork;

        $scope.hasData = function () {
            return !!domainList.length;
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: $translate.instant('DOMAIN_LIST_MODULE.CURRENTLY_NO_BLACK_LIST')
            });
        }

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10
        };

        $scope.showPagination = showPagination;
        $scope.confirmDeletion = confirmDeletion;
        $scope.backToListAdNetwork = backToListAdNetwork;

        function backToListAdNetwork() {
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adNetwork, '^.^.adNetwork.list');
        }

        function confirmDeletion(domain, index) {
            var modalInstance = $modal.open({
                templateUrl: 'videoManagement/domainList/confirmDeletion.tpl.html'
            });

            modalInstance.result.then(function () {
                return BlockListManager.one(domain.id).remove()
                    .then(
                    function () {
                        var index = domainList.indexOf(domain);

                        if (index > -1) {
                            domainList.splice(index, 1);
                        }

                        $scope.domainList = domainList;

                        if($scope.tableConfig.currentPage > 0 && domainList.length/10 == $scope.tableConfig.currentPage) {
                            AtSortableService.insertParamForUrl({page: $scope.tableConfig.currentPage});
                        }

                        AlertService.replaceAlerts({
                            type: 'success',
                            message:  $translate.instant('DOMAIN_LIST_MODULE.DELETE_BLACK_LIST_SUCCESS')
                        });
                    },
                    function () {
                        AlertService.replaceAlerts({
                            type: 'danger',
                            message:  $translate.instant('DOMAIN_LIST_MODULE.DELETE_BLACK_LIST_FAIL')
                        });
                    }
                )
                    ;
            });
        }

        function showPagination() {
            return angular.isArray($scope.domainList) && $scope.domainList.length > $scope.tableConfig.itemsPerPage;
        }

        $scope.$on('$locationChangeSuccess', function() {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.domainList)
        });
    }
})();