(function() {
    'use strict';

    angular.module('tagcade.unifiedReport.importHistory')
        .controller('ImportHistoryList', ImportHistoryList);

    function ImportHistoryList($scope, $modal, importHistoryList, dataSet, UnifiedReportImportHistoryManager, UnifiedReportDataSetManager, historyStorage, HISTORY_TYPE_PATH, AlertService, exportExcelService) {
        $scope.importHistoryList = importHistoryList;

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10
        };

        $scope.showPagination = showPagination;
        $scope.backToDataSetList = backToDataSetList;
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
                    .then(function () {
                        UnifiedReportDataSetManager.one(dataSet.id).one('importhistories').getList().then(function (importHistoryList) {
                            $scope.importHistoryList = importHistoryList.plain();

                            AlertService.replaceAlerts({
                                type: 'success',
                                message:  "The import history was undo successfully"
                            });
                        });
                    })
                    .catch(function () {
                        AlertService.replaceAlerts({
                            type: 'error',
                            message: "Could not undo the import history"
                        });
                    })
                ;
            });
        }
        
        function backToDataSetList() {
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.dataSet, '^.^.dataSet.list');
        }

        function showPagination() {
            return angular.isArray($scope.importHistoryList) && $scope.importHistoryList.length > $scope.tableConfig.itemsPerPage;
        }
    }
})();