(function() {
    'use strict';

    angular.module('tagcade.exchangeManagement')
        .controller('ExchangeList', ExchangeList)
    ;

    function ExchangeList($scope, $translate, $modal, AlertService, exchanges, AtSortableService, ExchangeManager, historyStorage, HISTORY_TYPE_PATH) {
        $scope.exchanges = exchanges;

        $scope.hasData = function () {
            return !!exchanges.length;
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: $translate.instant('EXCHANGE_MODULE.CURRENTLY_NO_EXCHANGE')
            });
        }

        $scope.showPagination = showPagination;
        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10
        };

        $scope.confirmDeletion = function (exchange) {
            var modalInstance = $modal.open({
                templateUrl: 'exchangeManagement/confirmDeletion.tpl.html'
            });

            modalInstance.result.then(function () {
                return ExchangeManager.one(exchange.id).remove()
                    .then(
                        function () {
                            var index = exchanges.indexOf(exchange);

                            if (index > -1) {
                                exchanges.splice(index, 1);
                            }

                            $scope.exchanges = exchanges;

                            if($scope.tableConfig.currentPage > 0 && exchanges.length/10 == $scope.tableConfig.currentPage) {
                                AtSortableService.insertParamForUrl({page: $scope.tableConfig.currentPage});
                            }

                            AlertService.replaceAlerts({
                                type: 'success',
                                message: $translate.instant('EXCHANGE_MODULE.DELETE_SUCCESS')
                            });
                    })
                    .catch(function () {
                        AlertService.replaceAlerts({
                            type: 'danger',
                            message: $translate.instant('EXCHANGE_MODULE.DELETE_FAIL')
                        });
                    })
                ;
            });
        };

        function showPagination() {
            return angular.isArray($scope.exchanges) && $scope.exchanges.length > $scope.tableConfig.itemsPerPage;
        }

        $scope.$on('$locationChangeSuccess', function() {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.exchange)
        });
    }
})();