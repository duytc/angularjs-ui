(function() {
    'use strict';

    angular.module('tagcade.unifiedReport.dataSet')
        .controller('dataSetList', dataSetList);

    function dataSetList($scope, $stateParams, $translate, dataSets, UnifiedReportDataSetManager, AlertService, AtSortableService, EVENT_ACTION_SORTABLE, HISTORY_TYPE_PATH, historyStorage) {
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

        $scope.deleteDataSet = deleteDataSet;
        $scope.showPagination = showPagination;
        $scope.changePage = changePage;
        $scope.searchData = searchData;

        function deleteDataSet($dataSetId) {
            if ($scope.formProcessing) {
                return; // already running, prevent duplicates
            }

            $scope.formProcessing = true;

            var deleteDataSource = UnifiedReportDataSetManager.one($dataSetId).remove();

            deleteDataSource.catch(function(response) {
                var errorCheck = ServerErrorProcessor.setFormValidationErrors(response, $scope.userForm, $scope.fieldNameTranslations);
                $scope.formProcessing = false;

                return errorCheck;
            }).then(function() {
                AlertService.addFlash({
                    type: 'success',
                    message: $translate.instant('UNIFIED_REPORT_DATA_SET_MODULE.DELETE_DATA_SET_SUCCESS')
                });
            }).then(function() {
                return historyStorage.getLocationPath(HISTORY_TYPE_PATH.dataSet, '^.list');
            });
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