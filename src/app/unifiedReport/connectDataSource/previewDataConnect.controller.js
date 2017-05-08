(function() {
    'use strict';

    angular.module('tagcade.unifiedReport.connect')
        .controller('PreviewDataConnect', PreviewDataConnect);

    function PreviewDataConnect($scope, $modal, connectDataSource, dataSourceEntries, listFilePaths, UnifiedReportDataSourceFileManager, UnifiedReportConnectDataSourceManager) {
        const ALERT_CODE_DATA_IMPORT_MAPPING_FAIL = 1201;
        const ALERT_CODE_DATA_IMPORT_REQUIRED_FAIL = 1202;
        const ALERT_CODE_FILTER_ERROR_INVALID_NUMBER = 1203;
        const ALERT_CODE_TRANSFORM_ERROR_INVALID_DATE = 1204;
        const ALERT_CODE_DATA_IMPORT_NO_HEADER_FOUND = 1205;
        const ALERT_CODE_DATA_IMPORT_NO_DATA_ROW_FOUND = 1206;
        const ALERT_CODE_WRONG_TYPE_MAPPING = 1207;
        const ALERT_CODE_FILE_NOT_FOUND = 1208;
        const ALERT_CODE_NO_FILE_PREVIEW = 1209;
        const ALERT_CODE_UN_EXPECTED_ERROR = 2000;

        $scope.connectDataSource = connectDataSource;
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

        $scope.processedDataSelectedData = {
            importedDataSource: dataSourceEntriesOld.id
        };

        $scope.originalDataSelectedData = {
            importedDataSource: dataSourceEntriesOld.id,
            limit: 500
        };

        $scope.viewProcessedData = function () {
            connectDataSource.dataSourceEntryId = $scope.processedDataSelectedData.importedDataSource;

            UnifiedReportConnectDataSourceManager.one('dryrun').post(null, connectDataSource)
                .then(function (reportData) {
                    $scope.tableConfigProcessed.currentPage = 1;

                    $scope.reportProcessedData = reportData;
                    $scope.processedColumns = !!reportData && angular.isObject(reportData.columns) ? _.keys(reportData.columns) : [];
                    $scope.processedReports = !!reportData && !!reportData.reports ? reportData.reports : [];
                    $scope.types = reportData.types;
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
        };

        $scope.viewOriginalData = function () {
            UnifiedReportDataSourceFileManager.one($scope.originalDataSelectedData.importedDataSource).one('preview').get({limit: $scope.originalDataSelectedData.limit})
                .then(function (originalData) {
                    $scope.tableConfigOriginal.currentPage = 1;

                    $scope.originalData = originalData;
                    $scope.originalColumns = originalData.columns;
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