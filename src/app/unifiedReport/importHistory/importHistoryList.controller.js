(function() {
    'use strict';

    angular.module('tagcade.unifiedReport.importHistory')
        .controller('ImportHistoryList', ImportHistoryList);

    function ImportHistoryList($scope, $modal, $stateParams, importHistoryList, dataSet, dataSource, UnifiedReportDataSetManager, UnifiedReportDataSourceManager, UnifiedReportImportHistoryManager, historyStorage, HISTORY_TYPE_PATH, AlertService, exportExcelService, AtSortableService, EVENT_ACTION_SORTABLE, ITEMS_PER_PAGE) {
        $scope.dataSet = dataSet;
        $scope.importHistoryList = importHistoryList;
        $scope.formProcessing = false;
        $scope.itemsPerPageList = ITEMS_PER_PAGE;

        $scope.changeItemsPerPage = changeItemsPerPage;

        $scope.hasData = function () {
            return !!$scope.importHistoryList && $scope.importHistoryList.totalRecord > 0;
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: 'There is currently no loaded data'
            });
        }

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10,
            totalItems: Number($scope.importHistoryList.totalRecord)
        };

        $scope.availableOptions = {
            currentPage: $stateParams.page || 1,
            pageSize: 10
        };

        var params = $stateParams;
        var getImport;

        $scope.showPagination = showPagination;
        $scope.backToList = backToList;
        $scope.undo= undo;
        $scope.downloadImportedData = downloadImportedData;
        $scope.previewData = previewData;
        $scope.changePage = changePage;
        $scope.searchData = searchData;

        $scope.$on(EVENT_ACTION_SORTABLE, function (event, query){
            params = angular.extend(params, query);
            _getImport(params);
        });

        function changePage(currentPage) {
            params = angular.extend(params, {page: currentPage});

            _getImport(params)
        }

        function searchData() {
            var query = {searchKey: $scope.selectData.query || ''};
            params = angular.extend(params, query);
            _getImport(params, 500)
        }

        function previewData(importHistory) {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            $scope.formProcessing = true;

            UnifiedReportImportHistoryManager.one(importHistory.id).one('download').get({limit: 1000})
                .then(function (reportData) {
                    $scope.formProcessing = false;

                    $modal.open({
                        templateUrl: 'unifiedReport/importHistory/previewData.tpl.html',
                        size: 'lg',
                        controller: function ($scope, reportData) {
                            $scope.reports = reportData || [];
                            $scope.columns = reportData.length > 0 ? _.keys(reportData[0]) : [];
                            $scope.search = {};

                            $scope.itemsPerPage = [
                                {label: '100', key: '100'},
                                {label: '500', key: '500'},
                                {label: '1000', key: '1000'},
                                {label: '5000', key: '5000'},
                                {label: '10000', key: '10000'}
                            ];

                            $scope.selectedData = {
                                limit: 1000
                            };

                            $scope.tableConfig = {
                                maxPages: 10,
                                itemsPerPage: 10
                            };

                            $scope.isNullValue = isNullValue;

                            function isNullValue(report, column) {
                                return !report[column] && report[column] != 0;
                            }

                            $scope.getPreview = function () {
                                UnifiedReportImportHistoryManager.one(importHistory.id).one('download').get({limit: $scope.selectedData.limit})
                                    .then(function (reportData) {
                                        $scope.reports = reportData || [];
                                    })
                            }
                        },
                        resolve: {
                            reportData: function () {
                                return reportData;
                            }
                        }
                    });
                })
                .catch(function (response) {
                    $scope.formProcessing = false;

                    $modal.open({
                        templateUrl: 'unifiedReport/connectDataSource/alertErrorPreview.tpl.html',
                        size: 'lg',
                        resolve: {
                            message: function () {
                                return 'An unknown server error occurred'
                            }
                        },
                        controller: function ($scope, message) {
                            $scope.message = message;
                        }
                    });
                })
        }

        function downloadImportedData(importHistory) {
            return UnifiedReportImportHistoryManager.one(importHistory.id).one('download').get()
                .then(function (data) {
                    var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
                    var reportName = 'import-history ' + importHistory.dataSet.name;

                    return saveAs(blob, [reportName + '.csv']);
                });
        }

        function undo(importHistory, index) {
            var modalInstance = $modal.open({
                templateUrl: 'unifiedReport/importHistory/confirmUndo.tpl.html'
            });

            modalInstance.result.then(function(){
                UnifiedReportImportHistoryManager.one(importHistory.id).one('undo').get()
                    .then(function () {
                        if(!!dataSet) {
                            historyStorage.getLocationPath(HISTORY_TYPE_PATH.importHistoryList, '^.list');
                        } else {
                            historyStorage.getLocationPath(HISTORY_TYPE_PATH.importHistoryList, '^.listForDataSource');
                        }

                        AlertService.addFlash({
                            type: 'success',
                            message:  "The import was unloaded successfully"
                        });
                    })
                    .catch(function () {
                        AlertService.replaceAlerts({
                            type: 'error',
                            message: "Could not unload the import"
                        });
                    })
                ;
            });
        }

        function backToList() {
            if(!!dataSet){
                return historyStorage.getLocationPath(HISTORY_TYPE_PATH.dataSet, '^.^.dataSet.list');
            }

            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.dataSource, '^.^.dataSource.list');
        }

        function showPagination() {
            return angular.isArray($scope.importHistoryList.records) && $scope.importHistoryList.totalRecord > $scope.tableConfig.itemsPerPage;
        }

        function _getImport(query, timeOut) {
            clearTimeout(getImport);

            getImport = setTimeout(function (){
                var Manage = !!query.dataSetId ? UnifiedReportDataSetManager.one(query.dataSetId) : UnifiedReportDataSourceManager.one(query.dataSourceId);

                return Manage.one('importhistories').get($stateParams)
                    .then(function (importHistoryList){
                        AtSortableService.insertParamForUrl(query);

                        setTimeout(function (){
                            $scope.importHistoryList = importHistoryList;
                            $scope.tableConfig.totalItems = Number(importHistoryList.totalRecord);
                            $scope.availableOptions.currentPage = Number(query.page);
                        }, 0)
                    });
            }, timeOut || 0)
        }

        $scope.$on('$locationChangeSuccess', function() {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.importHistoryList)
        });

        function changeItemsPerPage() {
            var query = {limit: $scope.tableConfig.itemsPerPage || ''};
            params = angular.extend(params, query);
            _getImport(params, 500);
        }
    }
})();