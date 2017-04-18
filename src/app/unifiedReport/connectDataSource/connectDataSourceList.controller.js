(function() {
    'use strict';

    angular.module('tagcade.unifiedReport.connect')
        .controller('ConnectDataSourceList', ConnectDataSourceList);

    function ConnectDataSourceList($scope, $modal, $translate, connectDataSources, dataSet, UnifiedReportConnectDataSourceManager, AlertService, AtSortableService, HISTORY_TYPE_PATH, historyStorage) {
        $scope.connectDataSources = connectDataSources;
        $scope.dataSet = dataSet;

        $scope.hasData = function () {
            return !!connectDataSources.length;
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: 'There is currently no connected data sources'
            });
        }

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10
        };

        $scope.backToDataSetList = backToDataSetList;
        $scope.showPagination = showPagination;
        $scope.confirmDeletion = confirmDeletion;
        $scope.reloadAllData = reloadAllData;
        $scope.cloneConnectDataSource = cloneConnectDataSource;

        function cloneConnectDataSource(connect) {
            $modal.open({
                templateUrl: 'unifiedReport/connectDataSource/cloneConnectedDataSource.tpl.html',
                size: 'lg',
                controller: 'CloneConnectedDataSource',
                resolve: {
                    connect: function () {
                        return connect;
                    }
                }
            });
        }

        function reloadAllData(connect) {
            UnifiedReportConnectDataSourceManager.one(connect.id).one('reloadalldatas').post()
                .then(function() {
                    AlertService.replaceAlerts({
                        type: 'success',
                        message: 'The data was reloaded. Please wait a few minutes for the changes to take effect.'
                    });
                })
                .catch(function() {
                    AlertService.replaceAlerts({
                        type: 'error',
                        message: 'The data could not be reloaded'
                    });
                });
        }

        function confirmDeletion(connectDataSource, index) {
            var modalInstance = $modal.open({
                templateUrl: 'unifiedReport/connectDataSource/confirmDeletion.tpl.html'
            });

            modalInstance.result.then(function () {
                return UnifiedReportConnectDataSourceManager.one(connectDataSource.id).remove()
                    .then(function () {
                        var index = connectDataSources.indexOf(connectDataSource);

                        if (index > -1) {
                            connectDataSources.splice(index, 1);
                        }

                        $scope.connectDataSources = connectDataSources;

                        if($scope.tableConfig.currentPage > 0 && connectDataSources.length/10 == $scope.tableConfig.currentPage) {
                            AtSortableService.insertParamForUrl({page: $scope.tableConfig.currentPage});
                        }

                        AlertService.replaceAlerts({
                            type: 'success',
                            message:  "The connected data source was removed successfully"
                        });
                    })
                    .catch(function () {
                        AlertService.replaceAlerts({
                            type: 'error',
                            message: "Could not remove the connected data source"
                        });
                    })
                    ;
            })
        }

        function backToDataSetList() {
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.dataSet, '^.^.dataSet.list');
        }

        function showPagination() {
            return angular.isArray($scope.connectDataSources) && $scope.connectDataSources.length > $scope.tableConfig.itemsPerPage;
        }

        $scope.$on('$locationChangeSuccess', function() {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.connectDataSource)
        });
    }
})();