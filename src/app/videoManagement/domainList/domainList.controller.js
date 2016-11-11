(function() {
    'use strict';

    angular.module('tagcade.videoManagement.domainList')
        .controller('DomainList', DomainList)
    ;

    function DomainList($scope, $state, $translate, $modal, AlertService, domainList, WhiteListManager, BlackListManager, AtSortableService, HISTORY_TYPE_PATH, historyStorage) {
        var blackList;
        $scope.blackList  = blackList = !!$state.params.blackList;
        $scope.domainList = domainList;

        $scope.hasData = function () {
            return !!domainList.length;
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: blackList ? $translate.instant('DOMAIN_LIST_MODULE.CURRENTLY_NO_BLACK_LIST') : $translate.instant('DOMAIN_LIST_MODULE.CURRENTLY_NO_WHITE_LIST')
            });
        }

        $scope.showPagination = showPagination;
        $scope.confirmDeletion = confirmDeletion;

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10
        };

        function confirmDeletion(domain, index) {
            var modalInstance = $modal.open({
                templateUrl: 'videoManagement/domainList/confirmDeletion.tpl.html'
            });

            modalInstance.result.then(function () {
                var removeManager = blackList ? BlackListManager.one(domain.id) : WhiteListManager.one(domain.id);
                return removeManager.remove()
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
                            message: blackList ? $translate.instant('DOMAIN_LIST_MODULE.DELETE_BLACK_LIST_SUCCESS') : $translate.instant('DOMAIN_LIST_MODULE.DELETE_WHITE_LIST_SUCCESS')
                        });
                    },
                    function () {
                        AlertService.replaceAlerts({
                            type: 'danger',
                            message:  blackList ? $translate.instant('DOMAIN_LIST_MODULE.DELETE_BLACK_LIST_FAIL') : $translate.instant('DOMAIN_LIST_MODULE.DELETE_WHITE_LIST_FAIL')
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