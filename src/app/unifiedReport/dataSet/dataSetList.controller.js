(function() {
    'use strict';

    angular.module('tagcade.unifiedReport.dataSet')
        .controller('dataSetList', dataSetList);

    function dataSetList($scope, $stateParams, $modal, $translate, dataSets, UnifiedReportDataSetManager, dataSetPendingJobs, AlertService, AtSortableService, EVENT_ACTION_SORTABLE, HISTORY_TYPE_PATH, historyStorage) {
        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10,
            totalItems: Number(dataSets.totalRecord)
        };

        $scope.dataSets = dataSets;
        $scope.dataSetPendingJobs = dataSetPendingJobs;

        $scope.availableOptions = {
            currentPage: $stateParams.page || 1,
            pageSize: 10
        };

        var getDataSet;
        var params = $stateParams;

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
        $scope.reloadDateRangeData = reloadDateRangeData;

        function reloadDateRangeData(dataSet) {
            if(dataSet.mapBuilderEnabled) {
                var params = {
                    option: 'allData',
                    startDate: null,
                    endDate: null
                };

                UnifiedReportDataSetManager.one(dataSet.id).one('reloads').post(null, params)
                    .then(function(data) {
                        dataSetPendingJobs[dataSet.id] = data.pendingLoads;

                        AlertService.replaceAlerts({
                            type: 'success',
                            message: 'The data was reloaded with '+ data.pendingLoads +' loaded files. Please wait a few minutes for the changes to take effect.'
                        });
                    })
                    .catch(function(response) {
                        if(!!response && !!response.data && !!response.data.message) {
                            AlertService.replaceAlerts({
                                type: 'danger',
                                message: response.data.message
                            });
                        }
                    });

                return
            }

            $modal.open({
                templateUrl: 'unifiedReport/dataSet/reloadDataSetDateRange.tpl.html',
                size: 'lg',
                resolve: {

                },
                controller: function ($scope, $modalInstance, DateFormatter) {
                    $scope.selected = {
                        option: 'allData',
                        date: {
                            startDate: moment().subtract(7, 'days'),
                            endDate: moment().subtract(1, 'days')
                        }
                    };

                    $scope.options = [
                        {key: 'allData', label: 'All Data'},
                        {key: 'detectedDateRange', label: 'Custom On Detected Date Range'},
                        {key: 'importedDate', label: 'Custom On Imported Date'}
                    ];

                    $scope.datePickerOpts = {
                        maxDate:  moment().endOf('day'),
                        ranges: {
                            'Today': [moment().startOf('day'), moment().endOf('day')],
                            'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                            'Last 7 Days': [moment().subtract(7, 'days'), moment().subtract(1, 'days')],
                            'Last 30 Days': [moment().subtract(30, 'days'), moment().subtract(1, 'days')],
                            'This Month': [moment().startOf('month'), moment().endOf('month')],
                            'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                        }
                    };

                    $scope.showReloadDaterange = function(item) {
                        for(var i in dataSet.connectedDataSources) {
                            var connectedDataSource = dataSet.connectedDataSources[i];

                            if((!connectedDataSource.dataSource || !connectedDataSource.dataSource.dateRangeDetectionEnabled) && item.key == 'detectedDateRange') {
                                return false
                            }
                        }

                        return true
                    };

                    $scope.isFormValid = function () {
                        return $scope.reloadForm.$valid
                    };

                    $scope.submit = function (date) {
                        $modalInstance.close();

                        var params = {
                            startDate: DateFormatter.getFormattedDate(date.startDate),
                            endDate: DateFormatter.getFormattedDate(date.endDate),
                            option: $scope.selected.option
                        };

                        UnifiedReportDataSetManager.one(dataSet.id).one('reloads').post(null, params)
                            .then(function(data) {
                                dataSetPendingJobs[dataSet.id] = data.pendingLoads;

                                AlertService.replaceAlerts({
                                    type: 'success',
                                    message: 'The data was reloaded with '+ data.pendingLoads +' loaded files. Please wait a few minutes for the changes to take effect.'
                                });
                            })
                            .catch(function(response) {
                                if(!!response && !!response.data && !!response.data.message) {
                                    AlertService.replaceAlerts({
                                        type: 'danger',
                                        message: response.data.message
                                    });
                                }
                            });
                    }

                }
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
            _getDataSet(params, 500);
        }

        $scope.$on(EVENT_ACTION_SORTABLE, function(event, query) {
            params = angular.extend(params, query);
            _getDataSet(params);
        });

        function changePage(currentPage) {
            params = angular.extend(params, {page: currentPage});
            _getDataSet(params);
        }

        function _getDataSet(query, ms) {
            clearTimeout(getDataSet);

            getDataSet = setTimeout(function() {
                params = query;
                return UnifiedReportDataSetManager.one().get(query)
                    .then(function(dataSets) {
                        AtSortableService.insertParamForUrl(query);
                        $scope.dataSets = dataSets;
                        $scope.tableConfig.totalItems = Number(dataSets.totalRecord);
                        $scope.availableOptions.currentPage = Number(query.page);


                        // get dataSetPendingJobs
                        var dataSetIds = [];
                        angular.forEach(dataSets.records, function (dataSet) {
                            dataSetIds.push(dataSet.id)
                        });

                        return UnifiedReportDataSetManager.one('pendingjobs').get({ids: dataSetIds.toString()}).then(function (dataSetPendingJobs) {
                            $scope.dataSetPendingJobs = dataSetPendingJobs.plain();
                        });
                    });
            }, ms || 0);
        }
    }
})();