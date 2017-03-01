(function() {
    'use strict';

    angular.module('tagcade.unifiedReport.dataSourceFile')
        .controller('DataSourceFileList', DataSourceFileList)
    ;

    function DataSourceFileList($scope, $q, $modal, AtSortableService, EVENT_ACTION_SORTABLE, $stateParams, dataSource, dataSourceFiles, UnifiedReportDataSourceManager, UnifiedReportDataSourceFileManager, $translate, AlertService, historyStorage, HISTORY_TYPE_PATH) {
        $scope.dataSourceFiles = (dataSourceFiles.constructor === Array) ? {
            records: dataSourceFiles,
            totalRecord: (dataSourceFiles.length)
        } : dataSourceFiles ;

        $scope.dataSource = dataSource;

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10,
            totalItems: Number($scope.dataSourceFiles.totalRecord)
        };

        $scope.availableOptions = {
            currentPage: $stateParams.page || 1,
            pageSize: 10
        };

        $scope.dataSourceId = $stateParams.dataSourceId;

        var getDataSourceEntry ;
        var params = {
            page: 1
        };

        $scope.formProcessing = false;
        $scope.checkAllItem = false;
        $scope.selectedDataSourceFiles = [];
        $scope.selectAll = selectAll;
        $scope.checkedDataSourceFile = checkedDataSourceFile;
        $scope.selectEntity = selectEntity;
        $scope.replayMultiData = replayMultiData;
        $scope.showPagination = showPagination;
        $scope.changePage = changePage;
        $scope.searchData = searchData;
        $scope.downloadDataSourceFile = downloadDataSourceFile;
        $scope.backToListDataSource = backToListDataSource;
        $scope.replayData = replayData;
        $scope.viewDetails = viewDetails;
        
        function viewDetails(dataSourceFile) {
            $modal.open({
                templateUrl: 'unifiedReport/dataSourceFile/viewDetails.tpl.html',
                size: 'lg',
                controller: function ($scope, dataSourceFile) {
                    var mapLabel = {
                        body: 'Email Body',
                        dateTime: 'Email Date',
                        from: 'Email From',
                        subject: 'Email Subject',
                        filename: 'Filename'
                    };

                    $scope.dataSourceFile = dataSourceFile;
                    $scope.metaData = dataSourceFile.metaData;

                    $scope.getLabelForKeyViewDetail = function (key) {
                        return !!mapLabel[key] ? mapLabel[key] : key
                    }
                },
                resolve: {
                    dataSourceFile: function () {
                        return dataSourceFile;
                    }
                }
            });
        }
        
        function replayData(dataSourceFile) {
            UnifiedReportDataSourceFileManager.one(dataSourceFile.id).one('replaydata').get()
                .then(function () {
                    AlertService.replaceAlerts({
                        type: 'success',
                        message: 'The Received Data was replayed'
                    });
                })
                .catch(function (response) {
                    if(!!response.data.message) {
                        AlertService.replaceAlerts({
                            type: 'error',
                            message: response.data.message
                        });
                    }

                    AlertService.replaceAlerts({
                        type: 'error',
                        message: 'The Received Data could not be replayed'
                    });
                })
        }

        $scope.confirmDeletion = function (dataSourceFile) {
            var modalInstance = $modal.open({
                templateUrl: 'unifiedReport/dataSourceFile/confirmDeletion.tpl.html'
            });

            modalInstance.result.then(function () {
                return UnifiedReportDataSourceFileManager.one(dataSourceFile.id).remove()
                    .then(
                        function () {
                            _getDataSourceFiles(params, 0)
                                .then(function () {
                                    AlertService.replaceAlerts({
                                        type: 'success',
                                        message: $translate.instant('UNIFIED_REPORT_DATA_SOURCE_ENTRY_MODULE.DELETE_SUCCESS')
                                    });
                                });
                        },
                        function () {
                            AlertService.replaceAlerts({
                                type: 'danger',
                                message: $translate.instant('UNIFIED_REPORT_DATA_SOURCE_ENTRY_MODULE.DELETE_FAIL')
                            });
                        }
                    )
                    ;
            });
        };

        function selectAll () {
            if($scope.selectedDataSourceFiles.length == $scope.dataSourceFiles.records.length) {
                $scope.selectedDataSourceFiles = []
            } else {
                angular.forEach($scope.dataSourceFiles.records, function (dataSourceFile) {
                    if($scope.selectedDataSourceFiles.indexOf(dataSourceFile.id) == -1) {
                        $scope.selectedDataSourceFiles.push(dataSourceFile.id)
                    }
                });
            }
        }

        function checkedDataSourceFile(dataSourceFile) {
            return $scope.selectedDataSourceFiles.indexOf(dataSourceFile.id) > -1
        }

        function selectEntity (dataSourceFile) {
            var index = $scope.selectedDataSourceFiles.indexOf(dataSourceFile.id);

            if(index == -1) {
                $scope.selectedDataSourceFiles.push(dataSourceFile.id)
            } else {
                $scope.selectedDataSourceFiles.splice(index, 1);
                $scope.checkAllItem = false;
            }

            if($scope.selectedDataSourceFiles.length == $scope.dataSourceFiles.records.length) {
                $scope.checkAllItem = true;
            }
        }

        function replayMultiData () {
            UnifiedReportDataSourceFileManager.one().customPUT({ids: $scope.selectedDataSourceFiles}, null, {replay: true})
                .then(function () {
                    AlertService.clearAll();
                    angular.forEach(angular.copy($scope.dataSourceFiles.records), function (dataSourceFile) {
                        if ($scope.selectedDataSourceFiles.indexOf(dataSourceFile.id) > -1) {
                            AlertService.replaceAlerts({
                                type: 'success',
                                message: 'The ' + dataSourceFile.fileName + ' was replayed'
                            });
                        }
                    });
                })
                .catch(function () {
                    AlertService.clearAll();
                    angular.forEach(angular.copy($scope.dataSourceFiles.records), function (dataSourceFile) {
                        if ($scope.selectedDataSourceFiles.indexOf(dataSourceFile.id) > -1) {
                            AlertService.replaceAlerts({
                                type: 'success',
                                message: 'The ' + dataSourceFile.fileName + ' could not be replayed'
                            });
                        }
                    });
                });
        }

        function backToListDataSource() {
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.dataSource, '^.^.dataSource.list');
        }

        function downloadDataSourceFile(dataSourceFileId) {
            return UnifiedReportDataSourceFileManager.one(dataSourceFileId).one('download').getRestangularUrl();
        }

        function showPagination() {
            return angular.isArray($scope.dataSourceFiles.records) && $scope.dataSourceFiles.totalRecord > $scope.tableConfig.itemsPerPage;
        }

        $scope.$on(EVENT_ACTION_SORTABLE, function(event, query) {
            params = angular.extend(params, query);
            _getDataSourceFiles(params);
        });

        $scope.$on('$locationChangeSuccess', function() {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.dataSourceFile)
        });

        function changePage(currentPage) {
            params = angular.extend(params, {page: currentPage});
            _getDataSourceFiles(params);
        }

        function searchData() {
            var query = {searchKey: $scope.selectData.query || ''};
            params = angular.extend(params, query);
            _getDataSourceFiles(params);
        }

        function _getDataSourceFiles(query, timeOut) {
            timeOut = (timeOut == undefined) ? 500 : timeOut;

            clearTimeout(getDataSourceEntry);

            return $q(function(resolve, reject) {
                getDataSourceEntry = setTimeout(function() {
                    if($stateParams.dataSourceId) {
                        return UnifiedReportDataSourceManager.one($stateParams.dataSourceId).customGET('datasourceentries', query)
                            .then(function(dataSourceFiles) {
                                AtSortableService.insertParamForUrl(query);

                                setTimeout(function() {
                                    $scope.dataSourceFiles = dataSourceFiles;
                                    $scope.tableConfig.totalItems = Number(dataSourceFiles.totalRecord);
                                    $scope.availableOptions.currentPage = Number(query.page);

                                    resolve(dataSourceFiles);
                                }, 0)
                            });

                    } else {
                        return UnifiedReportDataSourceFileManager.one().get(query)
                            .then(function(dataSourceFiles) {
                                AtSortableService.insertParamForUrl(query);

                                setTimeout(function() {
                                    $scope.dataSourceFiles = dataSourceFiles;
                                    $scope.tableConfig.totalItems = Number(dataSourceFiles.totalRecord);
                                    $scope.availableOptions.currentPage = Number(query.page);

                                    resolve(dataSourceFiles);
                                }, 0)
                            });
                    }
                }, timeOut);
            });
        }
    }
})();
