(function() {
    'use strict';

    angular.module('tagcade.unifiedReport.dataSet')
        .controller('dataSetList', dataSetList);

    function dataSetList($scope, $stateParams, $modal, $translate, dataSets, UnifiedReportDataSetManager, AlertService, AtSortableService, EVENT_ACTION_SORTABLE, HISTORY_TYPE_PATH, historyStorage) {
        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10,
            totalItems: Number(dataSets.totalRecord)
        };

        $scope.dataSets = dataSets;

        $scope.availableOptions = {
            currentPage: $stateParams.page || 1,
            pageSize: 10
        };

        var getDataSet;
        var params = {
            page: 1
        };

        $scope.selectData = {
            query: $stateParams.searchKey || null
        };

        $scope.hasData = function () {
            return !!$scope.dataSets && $scope.dataSets.totalRecord > 0;
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: 'There is currently no data sets'
            });
        }

        $scope.deleteDataSet = deleteDataSet;
        $scope.showPagination = showPagination;
        $scope.changePage = changePage;
        $scope.searchData = searchData;
        $scope.removeAllData = removeAllData;
        $scope.reloadAllData = reloadAllData;
        
        function reloadAllData(dataSet) {
            UnifiedReportDataSetManager.one(dataSet.id).one('reloadalldatas').post()
                .then(function(data) {
                    AlertService.replaceAlerts({
                        type: 'warning',
                        message: 'The data was reloaded with '+ data.pendingLoads +' loaded files. Please wait a few minutes for the changes to take effect.'
                    });
                })
                .catch(function() {
                    AlertService.replaceAlerts({
                        type: 'error',
                        message: 'The data could not be reloaded'
                    });
                });
        }
        
        function removeAllData(dataSet) {
            var modalInstance = $modal.open({
                templateUrl: 'unifiedReport/dataSet/removeAllDataConfirm.tpl.html'
            });

            modalInstance.result.then(function () {
                UnifiedReportDataSetManager.one(dataSet.id).one('truncate').post()
                    .then(function() {
                        dataSet.totalRow = 0;

                        AlertService.replaceAlerts({
                            type: 'success',
                            message: $translate.instant('UNIFIED_REPORT_DATA_SET_MODULE.REMOVE_ALL_DATE_SUCCESS')
                        });
                    })
                    .catch(function() {
                        AlertService.replaceAlerts({
                            type: 'error',
                            message: $translate.instant('UNIFIED_REPORT_DATA_SET_MODULE.REMOVE_ALL_DATE_FAIL')
                        });
                    });
            })
        }

        function deleteDataSet($dataSetId) {
            var modalInstance = $modal.open({
                templateUrl: 'unifiedReport/dataSet/confirmDeletion.tpl.html'
            });

            modalInstance.result.then(function () {
                var deleteDataSource = UnifiedReportDataSetManager.one($dataSetId).remove();

                deleteDataSource.then(function() {
                    AlertService.addFlash({
                        type: 'success',
                        message: $translate.instant('UNIFIED_REPORT_DATA_SET_MODULE.DELETE_DATA_SET_SUCCESS')
                    });
                }).then(function() {
                    return historyStorage.getLocationPath(HISTORY_TYPE_PATH.dataSet, '^.list');
                }).catch(function(response) {
                    if(!!response && !!response.data && !!response.data.message) {
                        AlertService.replaceAlerts({
                            type: 'danger',
                            message: response.data.message
                        });
                    }
                });
            })
        }

        function showPagination() {
            return angular.isArray($scope.dataSets.records) && $scope.dataSets.totalRecord > $scope.tableConfig.itemsPerPage;
        }

        $scope.$on('$locationChangeSuccess', function() {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.dataSet)
        });

        function searchData() {
            var query = {searchKey: $scope.selectData.query || ''};
            params = angular.extend(params, query);
            _getDataSet(params);
        }

        $scope.$on(EVENT_ACTION_SORTABLE, function(event, query) {
            params = angular.extend(params, query);
            _getDataSet(params);
        });

        function changePage(currentPage) {
            params = angular.extend(params, {page: currentPage});
            _getDataSet(params);
        }

        function _getDataSet(query) {
            clearTimeout(getDataSet);

            getDataSet = setTimeout(function() {
                params = query;
                return UnifiedReportDataSetManager.one().get(query)
                    .then(function(dataSets) {
                        AtSortableService.insertParamForUrl(query);
                        $scope.dataSets = dataSets;
                        $scope.tableConfig.totalItems = Number(dataSets.totalRecord);
                        $scope.availableOptions.currentPage = Number(query.page);
                    });
            }, 500);
        }
    }
})();