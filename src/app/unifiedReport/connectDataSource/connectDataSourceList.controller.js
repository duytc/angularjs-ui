(function () {
    'use strict';

    angular.module('tagcade.unifiedReport.connect')
        .controller('ConnectDataSourceList', ConnectDataSourceList);

    function ConnectDataSourceList($scope, $modal, $stateParams, $translate, connectDataSources, dataSet, UnifiedReportDataSetManager ,UnifiedReportConnectDataSourceManager, AlertService, AtSortableService, HISTORY_TYPE_PATH, historyStorage, ITEMS_PER_PAGE, EVENT_ACTION_SORTABLE) {
        var params = $stateParams;
        var getConnectedDataSource;

        $scope.itemsPerPageList = ITEMS_PER_PAGE;
        $scope.connectDataSources = connectDataSources.records;
        $scope.dataSet = dataSet;

        $scope.hasData = function () {
            return !!$scope.connectDataSources.length;
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: 'There is currently no connected data sources'
            });
        }

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10,
            totalItems: Number(connectDataSources.totalRecord)
        };

        $scope.availableOptions = {
            currentPage: $stateParams.page || 1,
            pageSize: 10
        };

        $scope.backToDataSetList = backToDataSetList;
        $scope.showPagination = showPagination;
        $scope.confirmDeletion = confirmDeletion;
        $scope.reloadDateRangeData = reloadDateRangeData;
        $scope.removeAllData = removeAllData;
        $scope.cloneConnectDataSource = cloneConnectDataSource;
        $scope.searchData = searchData;
        $scope.changePage = changePage;
        $scope.changeItemsPerPage = changeItemsPerPage;

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
                .then(function () {
                    AlertService.replaceAlerts({
                        type: 'success',
                        message: 'All data has been removed from the connected data source.'
                    });
                })
                .catch(function () {
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
                resolve: {},
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
                        {key: 'detectedDateRange', label: 'By Detected Date Range'},
                        {key: 'importedDate', label: 'By Import Date'}
                    ];

                    $scope.datePickerOpts = {
                        maxDate: moment().endOf('day'),
                        ranges: {
                            'Today': [moment().startOf('day'), moment().endOf('day')],
                            'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                            'Last 7 Days': [moment().subtract(7, 'days'), moment().subtract(1, 'days')],
                            'Last 30 Days': [moment().subtract(30, 'days'), moment().subtract(1, 'days')],
                            'This Month': [moment().startOf('month'), moment().endOf('month')],
                            'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                        }
                    };

                    $scope.showReloadDaterange = function (item) {
                        if ((!connect.dataSource || !connect.dataSource.dateRangeDetectionEnabled) && item.key == 'detectedDateRange') {
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
                            .then(function () {
                                AlertService.replaceAlerts({
                                    type: 'success',
                                    message: 'The data was reloaded. Please wait a few minutes for the changes to take effect.'
                                });
                            })
                            .catch(function (response) {
                                if (!!response && !!response.data && !!response.data.message) {
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

                        changeItemsPerPage();

                        AlertService.replaceAlerts({
                            type: 'success',
                            message: "The connected data source was removed successfully"
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
            return (angular.isArray($scope.connectDataSources) && (connectDataSources.totalRecord > $scope.tableConfig.itemsPerPage));
        }

        $scope.$on('$locationChangeSuccess', function () {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.connectDataSource)
        });

        $scope.$on(EVENT_ACTION_SORTABLE, function (event, query){
            params = angular.extend(params, query);
            _getConnectedDataSource(params);
        });

        function searchData() {
            var query = {searchKey: $scope.selectData.query || ''};
            params = angular.extend(params, query);
            _getConnectedDataSource(params, 500);
        }

        function changePage(currentPage){
            params = angular.extend(params, {
                page: currentPage
            });
            _getConnectedDataSource(params);
        }

        function changeItemsPerPage()
        {
            var query = {limit: $scope.tableConfig.itemsPerPage || ''};
            params.page = 1;
            params = angular.extend(params, query);
            _getConnectedDataSource(params, 500);
        }

        function _getConnectedDataSource(query, ms) {
            clearTimeout(getConnectedDataSource);

            getConnectedDataSource = setTimeout(function () {
                return UnifiedReportDataSetManager.one($stateParams.dataSetId).one('connecteddatasources').get($stateParams)
                    .then(function (connectedDataSources) {
                        AtSortableService.insertParamForUrl(query);

                        setTimeout(function () {
                            $scope.connectDataSources = connectedDataSources.records;
                            $scope.tableConfig.totalItems = Number(connectedDataSources.totalRecord);
                            $scope.availableOptions.currentPage = Number(query.page);
                        }, 0)
                    });
            }, ms || 0)

        }
    }
})();