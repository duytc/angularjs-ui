(function() {
    'use strict';

    angular.module('tagcade.unifiedReport.connect')
        .controller('PreviewDataConnect', PreviewDataConnect);

    function PreviewDataConnect($scope, $modal, $filter, connectDataSource, dataSourceEntries, listFilePaths, UnifiedReportDataSourceFileManager, UnifiedReportConnectDataSourceManager) {
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

        $scope.connectDataSource = connectDataSource;

        angular.forEach(dataSourceEntries, function (dataSourceEntrie) {
            dataSourceEntrie.fileName = (!!dataSourceEntrie.startDate && !!dataSourceEntrie.startDate ? (dataSourceEntrie.startDate == dataSourceEntrie.endDate ? $filter('date')(dataSourceEntrie.startDate, 'MMM d, y') : $filter('date')(dataSourceEntrie.startDate, 'MMM d, y') + ' - ' + $filter('date')(dataSourceEntrie.endDate, 'MMM d, y')) : '') + (!!dataSourceEntrie.startDate && !!dataSourceEntrie.startDate ? ' (' : '') + dataSourceEntrie.fileName + (!!dataSourceEntrie.startDate && !!dataSourceEntrie.startDate ? ')' : '');
        });

        $scope.dataSourceEntries = dataSourceEntries;
        $scope.reportProcessedData = [];
        $scope.originalData = [];

        $scope.search = {};
        $scope.types = [];

        $scope.itemsPerPage = [
            {label: '100', key: '100'},
            {label: '500', key: '500'},
            {label: '1000', key: '1000'},
            {label: '5000', key: '5000'},
            {label: '10000', key: '10000'}
        ];

        $scope.tableConfigOriginal = {
            maxPages: 10,
            itemsPerPage: 10
        };

        $scope.availableOptions = {
            currentPage: 1,
            pageSize: 10
        };

        $scope.tableConfigProcessed = {
            maxPages: 10,
            itemsPerPage: 10
        };

        $scope.originalColumns = [];
        $scope.processedColumns = [];

        $scope.originalReports = [];
        $scope.processedReports = [];

        angular.forEach(listFilePaths, function (filePath) {
            $scope.dataSourceEntries.push({
                id: filePath.filePath,
                fileName:  filePath.fileName
            });
        });

        var dataSourceEntriesOld = $scope.dataSourceEntries[$scope.dataSourceEntries.length - 1];

        $scope.selectedData = {
            importedDataSource: !!dataSourceEntriesOld ? dataSourceEntriesOld.id : null,
            limit: 500
        };

        $scope.viewProcessedData = function () {
            connectDataSource.dataSourceEntryId = $scope.selectedData.importedDataSource;
            connectDataSource.limit = $scope.selectedData.limit;
            connectDataSource.page = 1;

            _getProcessedData(connectDataSource);
        };

        $scope.viewOriginalData = function () {
            UnifiedReportDataSourceFileManager.one($scope.selectedData.importedDataSource).one('preview').get({limit: $scope.selectedData.limit})
                .then(function (originalData) {
                    $scope.tableConfigOriginal.currentPage = 1;

                    $scope.originalData = originalData;
                    $scope.originalColumns = _.keys(originalData.columns);
                    $scope.originalReports = originalData.reports;
                })
                .catch(function (response) {
                    $modal.open({
                        templateUrl: 'unifiedReport/connectDataSource/alertErrorPreview.tpl.html',
                        size: 'lg',
                        resolve: {
                            message: function () {
                                return convertMessage(response.data.message);
                            }
                        },
                        controller: function ($scope, message) {
                            $scope.message = message;
                        }
                    });
                });
        };

        $scope.isNullValue = isNullValue;
        $scope.getTotalRowDataSourceEntry = getTotalRowDataSourceEntry;
        $scope.selectImportedDataSource = selectImportedDataSource;
        
        $scope.isShow = isShow;
        $scope.sort = sort;
        $scope.changePage = changePage;
        $scope.searchReportView = searchReportView;
        $scope.showPagination = showPagination;
        
        function showPagination() {
            return angular.isArray($scope.processedReports) && $scope.tableConfigProcessed.totalItems > $scope.tableConfigProcessed.itemsPerPage;
        }

        function sort(keyname) {
            $scope.sortBy = '\u0022'+keyname+'\u0022'; //set the sortBy to the param passed
            $scope.reverse = !$scope.reverse; //if true make it false and vice versa

            connectDataSource = angular.extend(connectDataSource, {
                searches: $scope.search,
                limit: $scope.selectedData.limit,
                page: $scope.availableOptions.currentPage,
                orderBy: (!!$scope.reverse ? 'desc': 'asc'),
                sortField: $scope.sortBy
            });

            _getProcessedData(connectDataSource);
        }

        function changePage(currentPage) {
            connectDataSource = angular.extend(connectDataSource, {
                searches: $scope.search,
                limit: $scope.selectedData.limit,
                page: currentPage,
                orderBy: (!!$scope.reverse ? 'desc': 'asc'),
                sortField: $scope.sortBy
            });

            _getProcessedData(connectDataSource);
        }

        function isShow(sortColumn) {
            return ($scope.sortBy == '\u0022' + sortColumn + '\u0022')
        }
        
        function searchReportView() {
            connectDataSource = angular.extend(connectDataSource, {
                searches: $scope.search,
                limit: $scope.selectedData.limit,
                page: $scope.availableOptions.currentPage,
                orderBy: (!!$scope.reverse ? 'desc': 'asc'),
                sortField: $scope.sortBy
            });

            _getProcessedData(connectDataSource);
        }

        function _getProcessedData(params) {
            params.limitRows = params.limit;

            UnifiedReportConnectDataSourceManager.one('dryrun').post(null, params)
                .then(function (reportData) {
                    $scope.tableConfigProcessed.currentPage = 1;

                    $scope.reportProcessedData = reportData;
                    $scope.processedColumns = !!reportData && angular.isObject(reportData.columns) ? _.keys(reportData.columns) : [];
                    $scope.processedReports = !!reportData && !!reportData.reports ? reportData.reports : [];
                    $scope.types = reportData.types;
                    $scope.tableConfigProcessed.totalItems = reportData.total;
                })
                .catch(function (response) {
                    $modal.open({
                        templateUrl: 'unifiedReport/connectDataSource/alertErrorPreview.tpl.html',
                        size: 'lg',
                        resolve: {
                            message: function () {
                                return convertMessage(response.data.message);
                            }
                        },
                        controller: function ($scope, message) {
                            $scope.message = message;
                        }
                    });
                })
        }

        function selectImportedDataSource() {
            $scope.originalReports = [];
            $scope.processedReports = [];

            $scope.originalColumns = [];
            $scope.processedColumns = [];
        }

        function getTotalRowDataSourceEntry(id) {
            var dataSourceEntry = _.find($scope.dataSourceEntries, function (dataSourceEntrie) {
                return dataSourceEntrie.id == id;
            });

            return !!dataSourceEntry ? dataSourceEntry.totalRow : 0
        }

        function isNullValue(report, column) {
            return !report[column] && report[column] != 0;
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

        $scope.$watch('search', function() {
            angular.forEach(angular.copy($scope.search), function (value, key) {
                if((!value || value == '')) {
                    delete $scope.search[key]
                }
            })
        }, true);
    }
})();