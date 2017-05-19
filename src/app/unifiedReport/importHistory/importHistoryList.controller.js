(function() {
    'use strict';

    angular.module('tagcade.unifiedReport.importHistory')
        .controller('ImportHistoryList', ImportHistoryList);

    function ImportHistoryList($scope, $modal, importHistoryList, dataSet, dataSource, UnifiedReportImportHistoryManager, historyStorage, HISTORY_TYPE_PATH, AlertService, exportExcelService, AtSortableService) {
        $scope.dataSet = dataSet;
        $scope.importHistoryList = importHistoryList;
        $scope.formProcessing = false;

        $scope.hasData = function () {
            return !!importHistoryList.length;
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: 'There is currently no loaded data'
            });
        }

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10
        };

        $scope.showPagination = showPagination;
        $scope.backToList = backToList;
        $scope.undo= undo;
        $scope.downloadImportedData = downloadImportedData;
        $scope.previewData = previewData;

        function previewData(importHistory) {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            $scope.formProcessing = true;

            UnifiedReportImportHistoryManager.one(importHistory.id).one('download').get()
                .then(function (reportData) {
                    $scope.formProcessing = false;

                    $modal.open({
                        templateUrl: 'unifiedReport/importHistory/previewData.tpl.html',
                        size: 'lg',
                        controller: function ($scope, reportData) {
                            $scope.reports = reportData || [];
                            $scope.columns = reportData.length > 0 ? _.keys(reportData[0]) : [];
                            $scope.search = {};

                            $scope.tableConfig = {
                                maxPages: 10,
                                itemsPerPage: 10
                            };

                            $scope.isNullValue = isNullValue;

                            function isNullValue(report, column) {
                                return !report[column] && report[column] != 0;
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
                    if(data.length > 0) {
                        var header = Object.keys(data[0]);

                        exportExcelService.exportExcel(data, header, header, 'import-history ' + importHistory.dataSet.name + ' ' + importHistory.dataSourceEntry.dataSource.name, true);
                    }
                })
        }
        
        function undo(importHistory, index) {
            var modalInstance = $modal.open({
                templateUrl: 'unifiedReport/importHistory/confirmUndo.tpl.html'
            });

            modalInstance.result.then(function(){
                UnifiedReportImportHistoryManager.one(importHistory.id).one('undo').get()
                    .catch(function () {
                        AlertService.replaceAlerts({
                            type: 'error',
                            message: "Could not unload the import"
                        });
                    })
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
            return angular.isArray($scope.importHistoryList) && $scope.importHistoryList.length > $scope.tableConfig.itemsPerPage;
        }

        $scope.$on('$locationChangeSuccess', function() {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.importHistoryList)
        });
    }
})();