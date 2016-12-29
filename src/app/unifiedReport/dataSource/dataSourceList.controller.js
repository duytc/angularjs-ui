(function() {
    'use strict';

    angular.module('tagcade.unifiedReport.dataSource')
        .controller('DataSourceList', DataSourceList);

    function DataSourceList($scope, $translate, $modal, $stateParams, dataSources, EVENT_ACTION_SORTABLE, UnifiedReportDataSourceManager, AlertService, AtSortableService, HISTORY_TYPE_PATH, historyStorage) {

        var params = {
            page: 1
        };
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

        $scope.changePage = changePage;
        $scope.searchData = searchData;

        $scope.formProcessing = false;

        $scope.dataSources = dataSources;
        $scope.showPagination = showPagination;
        $scope.deleteDataSource = deleteDataSource;
        $scope.getAPIKey = getAPIKey;
        $scope.getUnifiedReportEmail = getUnifiedReportEmail;


        function showPagination() {
            return angular.isArray($scope.dataSources.records) && $scope.dataSources.totalRecord > $scope.tableConfig.itemsPerPage;
        }

        function changePage(currentPage) {
            params = angular.extend(params, {
                page: currentPage
            });
            _getDataSources(params);
        }

        function deleteDataSource($dataSourceId) {
            if ($scope.formProcessing) {
                return; // already running, prevent duplicates
            }

            $scope.formProcessing = true;

            var deleteDataSource = UnifiedReportDataSourceManager.one($dataSourceId).remove();

            deleteDataSource.catch(function(response) {
                var errorCheck = ServerErrorProcessor.setFormValidationErrors(response, $scope.userForm, $scope.fieldNameTranslations);
                $scope.formProcessing = false;

                return errorCheck;
            }).then(function() {
                AlertService.addFlash({
                    type: 'success',
                    message: $translate.instant('UNIFIED_REPORT_DATA_SOURCE_MODULE.DELETE_SUCCESS')
                });
            }).then(function() {
                return historyStorage.getLocationPath(HISTORY_TYPE_PATH.dataSource, '^.list');
            });
        }

        function getAPIKey(dataSource) {

            $modal.open({
                templateUrl: 'unifiedReport/dataSource/apiKey.tpl.html',
                resolve: {
                    apiKey: function() {
                        return UnifiedReportDataSourceManager.one(dataSource.id).customGET('apikey', {
                            secure: true
                        });
                    }
                },
                controller: function($scope, apiKey) {

                    $scope.selected = {
                        secure: true
                    };

                    $scope.dataSource = dataSource;
                    $scope.apiKey = apiKey;

                    $scope.getTextToCopy = function(string) {
                        return string.replace(/\n/g, '\r\n');
                    };

                    $scope.highlightText = function(apiKey) {
                        return apiKey;
                    };
                }
            });
        }

        function getUnifiedReportEmail(dataSource) {
            $modal.open({
                templateUrl: 'unifiedReport/dataSource/unifiedReportEmail.tpl.html',
                resolve: {
                    unifiedReportEmail: function() {
                        return UnifiedReportDataSourceManager.one(dataSource.id).customGET('uremail', {
                            secure: true
                        });
                    }
                },
                controller: function($scope, unifiedReportEmail) {

                    $scope.selected = {
                        secure: true
                    };

                    $scope.dataSource = dataSource;
                    $scope.unifiedReportEmail = unifiedReportEmail;

                    $scope.getTextToCopy = function(string) {
                        return string.replace(/\n/g, '\r\n');
                    };

                    $scope.highlightText = function(unifiedReportEmail) {
                        return unifiedReportEmail;
                    };
                }
            });
        }

        $scope.$on('$locationChangeSuccess', function() {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.dataSource)
        });

        $scope.$on(EVENT_ACTION_SORTABLE, function(event, query) {
            params = angular.extend(params, query);
            _getDataSources(params);
        });

        function searchData() {
            var query = {searchKey: $scope.selectData.query || ''};
            params = angular.extend(params, query);
            _getDataSources(params);
        }

        function _getDataSources(query) {
            clearTimeout(getSite);

            getSite = setTimeout(function() {
                return UnifiedReportDataSourceManager.one().get(query)
                    .then(function(dataSources) {
                        AtSortableService.insertParamForUrl(query);

                        setTimeout(function() {
                            $scope.dataSources = dataSources;
                            $scope.tableConfig.totalItems = Number(dataSources.totalRecord);
                            $scope.availableOptions.currentPage = Number(query.page);
                        }, 0)
                    });
            }, 500)

        }
    }
})();