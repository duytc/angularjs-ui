(function() {
    'use strict';

    angular.module('tagcade.unifiedReport.importHistory')
        .controller('ImportHistoryList', ImportHistoryList);

    function ImportHistoryList($scope, $modal, importHistoryList, dataSet, dataSource, UnifiedReportImportHistoryManager, UnifiedReportDataSourceManager, UnifiedReportDataSetManager, historyStorage, HISTORY_TYPE_PATH, AlertService, exportExcelService) {
        $scope.dataSet = dataSet;
        $scope.importHistoryList = importHistoryList;

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
                            message: "Could not undo the import history"
                        });
                    })
                    .then(function () {
                        var Manager = !!dataSet ? UnifiedReportDataSetManager.one(dataSet.id) : UnifiedReportDataSourceManager.one(dataSource.id);

                        Manager.one('importhistories').getList().then(function (importHistoryList) {
                            $scope.importHistoryList = importHistoryList.plain();

                            AlertService.replaceAlerts({
                                type: 'success',
                                message:  "The import history was undo successfully"
                            });
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
    }
})();