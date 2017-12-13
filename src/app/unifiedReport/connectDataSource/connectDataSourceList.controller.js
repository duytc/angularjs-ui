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
        $scope.reloadDateRangeData = reloadDateRangeData;
        $scope.removeAllData = removeAllData;
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

        function removeAllData(connect) {
            UnifiedReportConnectDataSourceManager.one(connect.id).one('removealldatas').post()
                .then(function() {
                    AlertService.replaceAlerts({
                        type: 'success',
                        message: 'All data has been removed from the connected data source.'
                    });
                })
                .catch(function() {
                    AlertService.replaceAlerts({
                        type: 'error',
                        message: 'Could not removed all data'
                    });
                });
        }

        function reloadDateRangeData(connect) {
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

                    $scope.helpText = {
                        detail: 'You can only reload detected date range if the data source has this feature enabled.',
                        title: 'Reload Data source'
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
                        if((!connect.dataSource || !connect.dataSource.dateRangeDetectionEnabled) && item.key == 'detectedDateRange') {
                            return false
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

                        UnifiedReportConnectDataSourceManager.one(connect.id).one('reloads').post(null, params)
                            .then(function() {
                                AlertService.replaceAlerts({
                                    type: 'success',
                                    message: 'The data was reloaded. Please wait a few minutes for the changes to take effect.'
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