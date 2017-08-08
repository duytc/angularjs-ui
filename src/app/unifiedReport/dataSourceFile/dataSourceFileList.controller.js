(function() {
    'use strict';

    angular.module('tagcade.unifiedReport.dataSourceFile')
        .controller('DataSourceFileList', DataSourceFileList)
    ;

    function DataSourceFileList($scope, $q, $modal, AtSortableService, allEntryIds, EVENT_ACTION_SORTABLE, $stateParams, dataSource, dataSourceFiles, UnifiedReportDataSourceManager, UnifiedReportDataSourceFileManager, $translate, AlertService, historyStorage, HISTORY_TYPE_PATH) {
        const ALERT_CODE_DATA_IMPORT_MAPPING_FAIL = 1201;
        const ALERT_CODE_DATA_IMPORT_REQUIRED_FAIL = 1202;
        const ALERT_CODE_FILTER_ERROR_INVALID_NUMBER = 1203;
        const ALERT_CODE_TRANSFORM_ERROR_INVALID_DATE = 1204;
        const ALERT_CODE_DATA_IMPORT_NO_HEADER_FOUND = 1205;
        const ALERT_CODE_DATA_IMPORT_NO_DATA_ROW_FOUND = 1206;
        const ALERT_CODE_WRONG_TYPE_MAPPING = 1207;
        const ALERT_CODE_FILE_NOT_FOUND = 1208;
        const ALERT_CODE_NO_FILE_PREVIEW = 1209;
        const ALERT_CODE_NO_DATE_FORMAT = 1210;
        const ALERT_CODE_UN_EXPECTED_ERROR = 2000;

        $scope.dataSourceFiles = (dataSourceFiles.constructor === Array) ? {
            records: dataSourceFiles,
            totalRecord: (dataSourceFiles.length)
        } : dataSourceFiles ;

        $scope.dataSource = dataSource;

        $scope.missingDate = [];
        angular.forEach($scope.dataSource.missingDate, function (date) {
            $scope.missingDate.push({date: date});
        });

        $scope.isShowAlert = true;

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
        var params = $stateParams;

        $scope.formProcessing = false;
        $scope.checkAllItem = false;
        $scope.selectedDataSourceFiles = [];

        var itemsForPager = [];

        $scope.hasData = function () {
            return !!$scope.dataSourceFiles && $scope.dataSourceFiles.totalRecord > 0;
        };

        if (!$scope.hasData()) {
            AlertService.addAlert({
                type: 'warning',
                message: 'There is currently no imported data'
            });
        }

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
        $scope.setItemForPager = setItemForPager;
        $scope.noneSelect = noneSelect;
        $scope.selectAllInPages = selectAllInPages;
        $scope.previewData = previewData;
        $scope.deleteAlertMulti = deleteAlertMulti;
        $scope.showDetailsMissingDates = showDetailsMissingDates;

        function showDetailsMissingDates() {
            $modal.open({
                templateUrl: 'unifiedReport/dataSourceFile/showMissingDate.tpl.html',
                controller: function ($scope, missingDate) {
                    $scope.missingDate = missingDate;
                    $scope.dataSource = dataSource;

                    $scope.tableConfig = {
                        itemsPerPage: 10,
                        maxPages: 7
                    };

                    $scope.showPagination = function () {
                        return angular.isArray($scope.missingDate) && $scope.missingDate.length > $scope.tableConfig.itemsPerPage;
                    };

                    $scope.backfillMissingDate = function () {
                        return UnifiedReportDataSourceManager.one($scope.dataSource.id).post('createbackfill')
                            .then(function () {
                                AlertService.addAlert({
                                    type: 'success',
                                    message: 'The backfill was created'
                                });
                            })
                    };
                },
                resolve: {
                    missingDate: function () {
                       return $scope.missingDate
                    }
                }
            });
        }

        function deleteAlertMulti() {
            var selectedDataSourceFiles = angular.copy($scope.selectedDataSourceFiles);

            UnifiedReportDataSourceFileManager.one('delete').post(null, {entries: $scope.selectedDataSourceFiles})
                .then(function () {
                    _getDataSourceFiles(params, 0)
                        .then(function () {
                            angular.forEach(angular.copy($scope.selectedDataSourceFiles), function (field) {
                                $scope.selectedDataSourceFiles.splice($scope.selectedDataSourceFiles.indexOf(field.id), 1);
                            });

                            itemsForPager = [];
                            noneSelect()
                        });

                    $scope.isShowAlert = false;
                    AlertService.replaceAlerts({
                        type: 'success',
                        message: selectedDataSourceFiles.length + ' imported data files have been deleted'
                    });
                });
        }
        
        function previewData(dataSourceFile) {
            UnifiedReportDataSourceFileManager.one(dataSourceFile.id).one('preview').get({limit: 1000})
                .then(function (reportView) {
                    $modal.open({
                        templateUrl: 'unifiedReport/dataSourceFile/previewData.tpl.html',
                        size: 'lg',
                        resolve: {
                            reportView: function () {
                                return reportView
                            }
                        },
                        controller: function ($scope, reportView) {
                            $scope.reportView = reportView;
                            $scope.columns = _.keys(reportView.columns);
                            $scope.reports = reportView.reports;

                            $scope.itemsPerPage = [
                                {label: '100', key: '100'},
                                {label: '500', key: '500'},
                                {label: '1000', key: '1000'},
                                {label: '5000', key: '5000'},
                                {label: '10000', key: '10000'}
                            ];

                            $scope.tableConfig = {
                                maxPages: 10,
                                itemsPerPage: 10
                            };

                            $scope.selectedData = {
                                limit: 1000
                            };

                            $scope.isNullValue = isNullValue;
                            $scope.viewData = viewData;

                            function isNullValue(report, column) {
                                return !report[column] && report[column] != 0;
                            }

                            function viewData() {
                                UnifiedReportDataSourceFileManager.one(dataSourceFile.id).one('preview').get({limit: $scope.selectedData.limit})
                                    .then(function (reportView) {
                                        $scope.reportView = reportView;
                                        $scope.columns = _.keys(reportView.columns);
                                        $scope.reports = reportView.reports;
                                    })
                            }
                        }
                    })
                })
                .catch(function (response) {
                    $scope.formProcessing = false;

                    $modal.open({
                        templateUrl: 'unifiedReport/connectDataSource/alertErrorPreview.tpl.html',
                        size: 'lg',
                        resolve: {
                            message: function () {
                                return  convertMessage(response.data.message);
                            }
                        },
                        controller: function ($scope, message) {
                            $scope.message = message;
                        }
                    });
                });
        }

        function selectAllInPages() {
            $scope.checkAllItem = true;
            $scope.selectedDataSourceFiles = angular.copy(allEntryIds);
        }

        function noneSelect() {
            $scope.checkAllItem = false;
            $scope.selectedDataSourceFiles = [];
        }

        function setItemForPager(item) {
            itemsForPager.push(item);
        }
        
        function viewDetails(dataSourceFile) {
            $modal.open({
                templateUrl: 'unifiedReport/dataSourceFile/viewDetails.tpl.html',
                size: 'lg',
                controller: function ($scope, dataSourceFile) {
                    $scope.mapLabel = {
                        date: 'Date',
                        body: 'Email Body',
                        dateTime: 'Email Date',
                        from: 'Email From',
                        subject: 'Email Subject',
                        filename: 'Filename'
                    };

                    $scope.dataSourceFile = dataSourceFile;
                    $scope.metaData = dataSourceFile.metaData;
                    
                    $scope.showAlert = function () {
                        if(!$scope.metaData || !angular.isObject($scope.metaData) || _.difference(_.keys($scope.mapLabel), _.keys($scope.metaData)).length == 6) {
                            return true
                        }

                        return false
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
            UnifiedReportDataSourceFileManager.one(dataSourceFile.id).one('replaydata').post()
                .then(function () {
                    noneSelect();

                    AlertService.replaceAlerts({
                        type: 'success',
                        message: 'The file ' + dataSourceFile.fileName + ' was reloaded'
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
                        type: 'success',
                        message: 'The file ' + dataSourceFile.fileName + ' could not be reloaded'
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
                                    if(allEntryIds.indexOf(dataSourceFile.id) > -1) {
                                        allEntryIds.splice(allEntryIds.indexOf(dataSourceFile.id), 1);
                                    }

                                    if($scope.selectedDataSourceFiles.indexOf(dataSourceFile.id) > -1) {
                                        $scope.selectedDataSourceFiles.splice($scope.selectedDataSourceFiles.indexOf(dataSourceFile.id), 1);
                                    }

                                    var indexItemsForPager = _.findIndex(itemsForPager, function (item) {
                                        return item.id == dataSourceFile.id
                                    });

                                    if(indexItemsForPager > -1) {
                                        itemsForPager.splice(indexItemsForPager, 1);
                                    }

                                    AlertService.replaceAlerts({
                                        type: 'success',
                                        message: $translate.instant('UNIFIED_REPORT_DATA_SOURCE_ENTRY_MODULE.DELETE_SUCCESS')
                                    });

                                    if($scope.tableConfig.totalItems == 0) {
                                        $scope.isShowAlert = false;
                                    }
                                });
                        }
                    )
                    .catch(function (response) {
                        var message = response && response.data && !!response.data.message ? response.data.message : $translate.instant('UNIFIED_REPORT_DATA_SOURCE_ENTRY_MODULE.DELETE_FAIL')
                        AlertService.replaceAlerts({
                            type: 'danger',
                            message: message
                        });
                    })
                    ;
            });
        };

        function selectAll () {
            if($scope.selectedDataSourceFiles.length == itemsForPager.length) {
                $scope.selectedDataSourceFiles = [];
                $scope.checkAllItem = false;
            } else {
                $scope.selectedDataSourceFiles = [];
                $scope.checkAllItem = true;

                angular.forEach(itemsForPager, function (item) {
                    if($scope.selectedDataSourceFiles.indexOf(item.id) == -1) {
                        $scope.selectedDataSourceFiles.push(item.id)
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


            if( _.difference(allEntryIds, $scope.selectedDataSourceFiles).length == 0) {
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
                                message: 'The imported files were reloaded'
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
                                message: 'The imported files could not be reloaded'
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
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.dataSourceFile);

            itemsForPager = [];
        });

        function changePage(currentPage) {
            params = angular.extend(params, {page: currentPage});

            _getDataSourceFiles(params)
                .then(function () {
                    // $scope.selectedDataSourceFiles = [];
                    // $scope.checkAllItem = false;
                });
        }

        function searchData() {
            var query = {searchKey: $scope.selectData.query || ''};
            params = angular.extend(params, query);
            _getDataSourceFiles(params, 500)
                .then(function () {
                    // $scope.selectedDataSourceFiles = [];
                    // $scope.checkAllItem = false;
                });
        }

        function _getDataSourceFiles(query, timeOut) {
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

                                    _resetCheckImported($scope.dataSourceFiles)
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
                }, timeOut || 0);
            });

            function _resetCheckImported(dataSourceFiles) {
                if( _.difference(allEntryIds, $scope.selectedDataSourceFiles).length == 0) {
                    $scope.checkAllItem = true;
                } else {
                    $scope.checkAllItem = false
                }
            }
        }

        function convertMessage(message) {
            try {
                message = angular.fromJson(message);
            } catch(err) {
                return message || 'An unknown server error occurred'
            }

            var code = message.code;
            var detail = message.detail;

            switch (code) {
                case ALERT_CODE_DATA_IMPORT_MAPPING_FAIL:
                    return 'Cannot preview data - no field in file is mapped to data set.';

                case ALERT_CODE_WRONG_TYPE_MAPPING:
                    return 'Cannot preview data - MAPPING ERROR: Found invalid content ' + '"' + detail.content + '"' + ' on field ' + '"' + detail.column + '"' + '.';

                case ALERT_CODE_DATA_IMPORT_REQUIRED_FAIL:
                    return 'Cannot preview data - REQUIRE ERROR: Required field ' + '"' + detail.column + '"' + ' does not exist.';

                case ALERT_CODE_FILTER_ERROR_INVALID_NUMBER:
                    return 'Cannot preview data - TRANSFORM ERROR: Invalid number format on field ' + '"' + detail.column + '"' + '.';

                case ALERT_CODE_TRANSFORM_ERROR_INVALID_DATE:
                    return 'Cannot preview data - TRANSFORM ERROR: Invalid date format on field ' + '"' + detail.column + '"' + '.';

                case ALERT_CODE_DATA_IMPORT_NO_HEADER_FOUND:
                    return 'Cannot preview data - the file in data source has no data.';

                case ALERT_CODE_DATA_IMPORT_NO_DATA_ROW_FOUND:
                    return 'Cannot preview data - the file in data source has no data.';

                case ALERT_CODE_FILE_NOT_FOUND:
                    return 'Cannot preview data - file does not exist.';

                case ALERT_CODE_UN_EXPECTED_ERROR:
                    return 'Cannot preview data - unexpected error, please contact your account manager';

                case ALERT_CODE_NO_FILE_PREVIEW:
                    return 'cannot find any file in this data source for dry run';

                case ALERT_CODE_NO_DATE_FORMAT:
                    return 'FILTER ERROR: Invalid date format on field "' + detail.column +'".';

                default:
                    return 'Unknown code (' + detail.code + ')';
            }
        }
    }
})();
