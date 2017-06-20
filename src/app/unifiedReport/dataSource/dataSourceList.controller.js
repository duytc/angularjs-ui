(function (){
    'use strict';

    angular.module('tagcade.unifiedReport.dataSource')
        .controller('DataSourceList', DataSourceList);

    function DataSourceList($scope, $translate, $modal, $stateParams, dataSources, EVENT_ACTION_SORTABLE, UnifiedReportDataSourceManager, AlertService, AtSortableService, HISTORY_TYPE_PATH, historyStorage){
        var params = $stateParams;
        var getSite;

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10,
            totalItems: Number(dataSources.totalRecord)
        };

        $scope.availableOptions = {
            currentPage: $stateParams.page || 1,
            pageSize: 10
        };

        $scope.selectData = {
            query: $stateParams.searchKey || null
        };

        $scope.formProcessing = false;

        $scope.dataSources = dataSources;

        $scope.hasData = function () {
            return !!$scope.dataSources && $scope.dataSources.totalRecord > 0;
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: 'There is currently no data sources'
            });
        }


        $scope.changePage = changePage;
        $scope.searchData = searchData;
        $scope.showPagination = showPagination;
        $scope.deleteDataSource = deleteDataSource;
        $scope.getAPIKey = getAPIKey;
        $scope.getUnifiedReportEmail = getUnifiedReportEmail;
        $scope.viewBackfillHistory = viewBackfillHistory;
        $scope.changeBackfill = changeBackfill;

        function changeBackfill(dataSource) {
            $modal.open({
                templateUrl: 'unifiedReport/dataSource/changeBackfill.tpl.html',
                size: 'lg',
                controller: function ($scope, $modalInstance, dataSource, AlertService, dateUtil, UnifiedReportDataSourceManager) {
                    $scope.dataSource = dataSource;

                    $scope.datePickerOpts = {
                        singleDatePicker: true
                    };

                    angular.forEach($scope.dataSource.dataSourceIntegrations, function (dataSourceIntegration) {
                        delete dataSourceIntegration.integration;
                        delete dataSourceIntegration.schedule;
                        delete dataSourceIntegration.params;
                        delete dataSourceIntegration.active;

                        if(!angular.isObject(dataSourceIntegration.backFillStartDate)) {
                            dataSourceIntegration.backFillStartDate = {
                                startDate: dataSourceIntegration.backFillStartDate,
                                endDate: dataSourceIntegration.backFillStartDate
                            }
                        }

                        if(!angular.isObject(dataSourceIntegration.backFillEndDate)) {
                            dataSourceIntegration.backFillEndDate = {
                                startDate: dataSourceIntegration.backFillEndDate,
                                endDate: dataSourceIntegration.backFillEndDate
                            }
                        }
                    });

                    $scope.submit = function (){
                        $modalInstance.close();

                        var dataSourceIntegrations = angular.copy($scope.dataSource.dataSourceIntegrations);
                        angular.forEach(dataSourceIntegrations, function (dataSourceIntegration) {
                            delete dataSourceIntegration.id;

                            angular.forEach(dataSourceIntegration.params, function (param) {
                                if(param.type == 'date') {
                                    param.value = dateUtil.getFormattedDate(param.value.startDate);
                                }

                                if(param.type == 'option') {
                                    delete param.optionValues
                                }

                                if(param.type == 'bool' && !param.value) {
                                    param.value = false
                                }
                            });

                            if(!!dataSourceIntegration.backFillStartDate && !!dataSourceIntegration.backFillStartDate.startDate) {
                                dataSourceIntegration.backFillStartDate = dateUtil.getFormattedDate(dataSourceIntegration.backFillStartDate.startDate);
                            } else {
                                dataSourceIntegration.backFillStartDate = null;
                            }

                            if(!!dataSourceIntegration.backFillEndDate && !!dataSourceIntegration.backFillEndDate.startDate) {
                                dataSourceIntegration.backFillEndDate = dateUtil.getFormattedDate(dataSourceIntegration.backFillEndDate.startDate);
                            } else {
                                dataSourceIntegration.backFillEndDate = null;
                            }
                        });

                        var saveDataSource = UnifiedReportDataSourceManager.one(dataSource.id).patch({dataSourceIntegrations: dataSourceIntegrations});
                        saveDataSource.catch(function (response){
                            AlertService.addAlert({
                                type: 'error',
                                message: 'The data source could not be updated backfill'
                            });
                        }).then(function (){
                            AlertService.addAlert({
                                type: 'success',
                                message: 'The data source has been updated backfill'
                            });
                        })
                    }
                },
                resolve: {
                    dataSource: function (UnifiedReportDataSourceManager) {
                        return UnifiedReportDataSourceManager.one(dataSource.id).get();
                    }
                }
            });
        }

        function viewBackfillHistory(dataSource) {
            $modal.open({
                templateUrl: 'unifiedReport/dataSource/viewBackfillHistory.tpl.html',
                size: 'lg',
                controller: function ($scope, dataSource, backfillHistories) {
                    $scope.dataSource = dataSource;
                    $scope.backfillHistories = backfillHistories;

                    $scope.tableConfig = {
                        maxPages: 10,
                        itemsPerPage: 10
                    };

                    $scope.showPagination = function () {
                        return angular.isArray($scope.backfillHistories) && $scope.backfillHistories.length > $scope.tableConfig.itemsPerPage;
                    }

                },
                resolve: {
                    dataSource: function () {
                        return dataSource;
                    },
                    backfillHistories: function () {
                        return UnifiedReportDataSourceManager.one(dataSource.id).getList('backfillhistories');
                    }
                }
            });
        }

        function showPagination(){
            return angular.isArray($scope.dataSources.records) && $scope.dataSources.totalRecord > $scope.tableConfig.itemsPerPage;
        }

        function changePage(currentPage){
            params = angular.extend(params, {
                page: currentPage
            });
            _getDataSources(params);
        }

        function deleteDataSource($dataSourceId){
            if ($scope.formProcessing) {
                return; // already running, prevent duplicates
            }

            $scope.formProcessing = true;

            var deleteDataSource = UnifiedReportDataSourceManager.one($dataSourceId).remove();

            deleteDataSource.catch(function (response){
                var errorCheck = ServerErrorProcessor.setFormValidationErrors(response, $scope.userForm, $scope.fieldNameTranslations);
                $scope.formProcessing = false;

                return errorCheck;
            }).then(function (){
                AlertService.addFlash({
                    type: 'success',
                    message: $translate.instant('UNIFIED_REPORT_DATA_SOURCE_MODULE.DELETE_SUCCESS')
                });
            }).then(function (){
                return historyStorage.getLocationPath(HISTORY_TYPE_PATH.dataSource, '^.list');
            });
        }

        function getAPIKey(dataSource){

            $modal.open({
                templateUrl: 'unifiedReport/dataSource/apiKey.tpl.html',
                resolve: {
                    apiKey: function (){
                        return UnifiedReportDataSourceManager.one(dataSource.id).customGET('apikey', {
                            secure: true
                        });
                    }
                },
                controller: function ($scope, apiKey){

                    $scope.selected = {
                        secure: true
                    };

                    $scope.dataSource = dataSource;
                    $scope.apiKey = apiKey;

                    $scope.getTextToCopy = function (string){
                        return string.replace(/\n/g, '\r\n');
                    };

                    $scope.regenerateApiKey = function (){
                        var updateApiKey = UnifiedReportDataSourceManager.one(dataSource.id).one('regenerateurapikeys').post();

                        setTimeout(function (){
                            var newApiKey = UnifiedReportDataSourceManager.one(dataSource.id).customGET('apikey', {
                                secure: true
                            });

                            newApiKey.catch(function (response){
                                var errorCheck = ServerErrorProcessor.setFormValidationErrors(response, $scope.userForm, $scope.fieldNameTranslations);
                                $scope.formProcessing = false;

                                return errorCheck;
                            }).then(function (response){
                                $scope.apiKey = response;
                            });

                        }, 2000);
                    }
                }
            });
        }

        function getUnifiedReportEmail(dataSource){
            $modal.open({
                templateUrl: 'unifiedReport/dataSource/unifiedReportEmail.tpl.html',
                resolve: {
                    unifiedReportEmail: function (){
                        return UnifiedReportDataSourceManager.one(dataSource.id).customGET('uremail', {
                            secure: true
                        });
                    }
                },
                controller: function ($scope, unifiedReportEmail){

                    $scope.selected = {
                        secure: true
                    };

                    $scope.dataSource = dataSource;
                    $scope.unifiedReportEmail = unifiedReportEmail;

                    $scope.getTextToCopy = function (string){
                        return string.replace(/\n/g, '\r\n');
                    };

                    $scope.regenerateUnifiedReportEmail = function (){
                        var updateUREmail = UnifiedReportDataSourceManager.one(dataSource.id).one('regenerateuremails').post();

                        setTimeout(function (){
                            var newUrEmail = UnifiedReportDataSourceManager.one(dataSource.id).customGET('uremail', {
                                secure: true
                            });

                            newUrEmail.catch(function (response){
                                var errorCheck = ServerErrorProcessor.setFormValidationErrors(response, $scope.userForm, $scope.fieldNameTranslations);
                                $scope.formProcessing = false;

                                return errorCheck;
                            }).then(function (response){
                                $scope.unifiedReportEmail = response;
                            });

                        }, 2000);

                    };
                }
            });
        }

        $scope.$on('$locationChangeSuccess', function (){
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.dataSource)
        });

        $scope.$on(EVENT_ACTION_SORTABLE, function (event, query){
            params = angular.extend(params, query);
            _getDataSources(params);
        });

        function searchData(){
            var query = {searchKey: $scope.selectData.query || ''};
            params = angular.extend(params, query);
            _getDataSources(params, 500);
        }

        function _getDataSources(query, ms){
            clearTimeout(getSite);

            getSite = setTimeout(function (){
                return UnifiedReportDataSourceManager.one().get(query)
                    .then(function (dataSources){
                        AtSortableService.insertParamForUrl(query);

                        setTimeout(function (){
                            $scope.dataSources = dataSources;
                            $scope.tableConfig.totalItems = Number(dataSources.totalRecord);
                            $scope.availableOptions.currentPage = Number(query.page);
                        }, 0)
                    });
            }, ms || 0)

        }
    }
})();