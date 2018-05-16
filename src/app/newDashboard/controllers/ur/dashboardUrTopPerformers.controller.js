(function () {
    'use strict';

    angular.module('tagcade.newDashboard')
        .controller('DashboardUrTopPerformers', DashboardUrTopPerformers)
    ;

    function DashboardUrTopPerformers($scope, _, dashboard, videoReportService, dataService, Auth, NewDashboardUtil,
                                      DASHBOARD_TYPE_JSON, REPORT_SETTINGS, API_PERFORMANCE_UNIFIED_REPORTS_BASE_URL,
                                      COLUMNS_NAME_MAPPING_FOR_VIDEO_REPORT) {
        $scope.userSession = Auth.getSession();
        $scope.isAdmin = Auth.isAdmin();

        $scope.topPerformersData = {
            topPublishers: [],
            topSites: [],
            topAdNetworks: []
        };

        $scope.topPerformersVideoFullData = {
            reports: []
        };

        // data with limited 10 rows
        $scope.topPerformersVideoData = {
            reports: []
        };

        $scope.topPerformersUnifiedReportData = {
            columns: [],
            total: [],
            types: []
        };

        $scope.videoMetrics = [
            'billedAmount',
            'requests',
            'impressions',
            'bids',
            'errors',
            'blocks',
            'requestFillRate'
        ];

        $scope.sortFieldForVideo = $scope.isAdmin ? 'billedAmount' : 'requests';
        $scope.sortOrderForVideo = 'desc';

        var rowCount = 10;

        // for display
        $scope.configTopStatistics = {
            itemsPerPage: rowCount,
            maxPages: 10
        };
        $scope.configTopPublishers = $scope.configTopStatistics;
        $scope.configTopSites = $scope.configTopStatistics;
        $scope.configTopAdNetworks = $scope.configTopStatistics;

        $scope.columnNameMappingForVideoReport = COLUMNS_NAME_MAPPING_FOR_VIDEO_REPORT;

        $scope.queryParams = angular.copy(REPORT_SETTINGS.default.view.report.videoReport);

        // for ur
        $scope.tableConfigForUnifiedReport = {
            itemsPerPage: rowCount,
            maxPages: 1,
            totalItems: 10
        };

        $scope.titleColumnsForUnifiedReport = [];
        $scope.reverseForUnifiedReport = true; // default sort 'desc'
        $scope.columnPositions = [];
        $scope.columnTypesForUnifiedReport = [];
        $scope.dateFieldFormatsForUnifiedReport = [];

        // end - for ur
        $scope.isShowForUnifiedReport = isShowForUnifiedReport;
        $scope.showPagination = showPagination;
        $scope.hasKeyObjectForVideoReport = hasKeyObjectForVideoReport;
        $scope.getSortIconClass = getSortIconClass;
        $scope.onClickSortForVideo = onClickSortForVideo;
        $scope.isShowSortIconForVideoReport = isShowSortIconForVideoReport;

        $scope.showPaginationForUnifiedReport = showPaginationForUnifiedReport;
        $scope.sortUnifiedReport = sortUnifiedReport;
        $scope.isShowFieldForUnifiedReport = isShowFieldForUnifiedReport;
        $scope.isNullValue = isNullValue;

        /* watch dashboard type changed, then render for display or video or unified report */
        // $scope.$watch('dashboardType', _onDashBoardTypeChange);
        $scope.$watch('rootWatchManager.dashboardTypeChanged', _onDashBoardTypeChange);

        /* watch reportView changed, then render for unified report */
        $scope.$watch('reportView', _onReportViewChange);

        /* watch dateRange changed, then re-get data for display or video or unified report */
        $scope.$watch('dateRange', _onDateRangeChange);

        /* all scope functions ===================== */

        function isShowForUnifiedReport() {
            return DASHBOARD_TYPE_JSON[$scope.dashboardType.id] === DASHBOARD_TYPE_JSON.UNIFIED_REPORT;
        }

        function showPagination() {
            return angular.isArray($scope.topPerformersVideoData.reports) && $scope.topPerformersVideoData.reports.length > $scope.configTopStatistics.itemsPerPage;
        }

        function showPaginationForUnifiedReport() {
            return angular.isArray($scope.topPerformersUnifiedReportData.reports) && $scope.topPerformersUnifiedReportData.reports.length > $scope.configTopStatistics.itemsPerPage;
        }

        function getSortIconClass() {
            return $scope.sortOrderForVideo === 'asc' ? 'glyphicon-chevron-up' : 'glyphicon-chevron-down';
        }

        function onClickSortForVideo(field) {
            $scope.sortFieldForVideo = field;
            $scope.sortOrderForVideo = $scope.sortOrderForVideo === 'desc' ? 'asc' : 'desc';

            console.log('sort by: ', field, $scope.sortOrderForVideo);

            /* sort data */
            _sortVideoReport();
        }

        function isShowSortIconForVideoReport(field) {
            return field === $scope.sortFieldForVideo;
        }

        function hasKeyObjectForVideoReport(object, key) {
            if (!angular.isObject(object)) {
                return false;
            }

            if (['date'].indexOf(key) > -1) {
                if (key === 'date') {
                    return Object.keys(object).indexOf(key) > -1;
                }
            }

            return Object.keys(object).indexOf(key) > -1 && $scope.videoMetrics.indexOf(key) > -1
        }

        function sortUnifiedReport(column) {
            $scope.sortByForUnifiedReport = column;
            $scope.reverseForUnifiedReport = !$scope.reverseForUnifiedReport; // if true make it false and vice versa

            /* sort data */
            _sortUnifiedReports();
        }

        function isShowFieldForUnifiedReport(sortColumn) {
            return ($scope.sortByForUnifiedReport === sortColumn)
        }

        function isNullValue(report, column) {
            return !report[column] && report[column] !== 0;
        }

        /* all local functions ===================== */
        function _onDashBoardTypeChange() {
            if (isShowForUnifiedReport()) {
                _updateTopPerformersForUnifiedReport();
            }
        }

        function _onReportViewChange() {
            if (!isShowForUnifiedReport()) {
                return;
            }

            _updateTopPerformersForUnifiedReport();
        }

        function _onDateRangeChange(newValue, oldValue, scope) {
            if (!NewDashboardUtil.isDifferentDate(newValue, oldValue)) {
                return; // ignore if date range not change. Case: move cursor in date range picker value
            }
            if (isShowForUnifiedReport()) {
                _updateTopPerformersForUnifiedReport();
            }
        }

        function _sortVideoReport() {
            if (!$scope.topPerformersVideoFullData || !$scope.topPerformersVideoFullData.reports) {
                return;
            }

            // sort
            $scope.topPerformersVideoFullData.reports.sort(function (r1, r2) {
                if (r1[$scope.sortFieldForVideo] === r2[$scope.sortFieldForVideo]) {
                    return 0;
                }

                return (r1[$scope.sortFieldForVideo] < r2[$scope.sortFieldForVideo])
                    ? ($scope.sortOrderForVideo === 'desc' ? 1 : -1)
                    : ($scope.sortOrderForVideo === 'desc' ? -1 : 1);
            });

            // get top 10 records
            var data = angular.copy($scope.topPerformersVideoFullData);
            var reports = data.reports;
            if (reports && angular.isArray(reports) && reports.length > 10) {
                reports = reports.slice(0, 10);
                data.reports = reports;
            }

            $scope.topPerformersVideoData = data;
        }

        function _updateTopPerformersForUnifiedReport() {
            if (!$scope.reportView || !$scope.reportView.id) {
                return;
            }

            /* get topPerformersUnifiedReportData due to reportView */
            var stringDate = NewDashboardUtil.getStringDate($scope.dateRange);
            var params = {
                masterReport: $scope.reportView.id,
                startDate: stringDate.startDate,
                endDate: stringDate.endDate
            };

            dataService.makeHttpPOSTRequest('', params, API_PERFORMANCE_UNIFIED_REPORTS_BASE_URL + '/topperformers')
                .then(function (response) {
                    $scope.topPerformersUnifiedReportData = response;

                    /* update titleColumnsForUnifiedReport */
                    $scope.titleColumnsForUnifiedReport = angular.extend({}, $scope.titleColumnsForUnifiedReport, $scope.topPerformersUnifiedReportData.columns);

                    /* update column types */
                    $scope.columnTypesForUnifiedReport = $scope.topPerformersUnifiedReportData.types;

                    /* update date field formats */
                    $scope.dateFieldFormatsForUnifiedReport = $scope.topPerformersUnifiedReportData.dateFieldFormats;

                    /* update column position default or get from format of reportView */
                    _updateColumnPositions();

                    /* get default sort field */
                    $scope.sortByForUnifiedReport = _getDefaultSortField();

                    /* sort data */
                    _sortUnifiedReports();
                })
                .catch(function (response) {
                    return {
                        status: response.status,
                        message: response.data.message
                    }
                });
        }

        function _updateColumnPositions() {
            if (!$scope.reportView) {
                return;
            }

            var reports = $scope.topPerformersUnifiedReportData.reports;
            if (!angular.isArray(reports) || reports.length < 1) {
                return;
            }

            var columnPositions = [];
            var hasColumnPositions = false;

            /* update columnPositions due to formats transform from report view */
            if (!!$scope.reportView.formats && !!$scope.reportView.formats.length) {
                angular.forEach($scope.reportView.formats, function (format) {
                    if (!hasColumnPositions && format.type === 'columnPosition' && format.fields.length > 0) {
                        // append all transform fields to first post columnPositions
                        columnPositions = format.fields;

                        hasColumnPositions = angular.isArray(columnPositions) && columnPositions.length > 0;
                    }
                });
            }

            // set columnPositions is all fields from first report data
            var fieldTypes = $scope.topPerformersUnifiedReportData.types;

            // get dimensions from data sets of reportViews, join fields, add fields, ...
            var dimensions = $scope.reportView.dimensions;

            // but need add dimension first, let dimension date first, sort alphabet
            dimensions = _.uniq(dimensions);

            dimensions = _.sortBy(dimensions);

            angular.forEach(angular.copy(dimensions), function (dimension) {
                if (fieldTypes[dimension] === 'date' || fieldTypes[dimension] === 'datetime') {
                    dimensions.splice(dimensions.indexOf(dimension), 1);
                    dimensions.unshift(dimension);
                }
            });

            // get metrics from data sets of reportViews, join fields, add fields, ...
            var metrics = _getFieldsFromShowInTotal($scope.reportView);
            if (!angular.isArray(metrics) || metrics.length < 1) {
                // do not show any things if not have metrics
                $scope.columnPositions = [];
                return;
            }

            // then add metric after, let metric date first, sort alphabet
            metrics = _.sortBy(metrics);

            angular.forEach(angular.copy(metrics), function (metric) {
                if (fieldTypes[metric] === 'date' || fieldTypes[metric] === 'datetime') {
                    metrics.splice(metrics.indexOf(metric), 1);
                    metrics.unshift(metric);
                }
            });

            // remove not selected fields in metrics from column positions
            var newColumnPositions = [];
            angular.forEach(columnPositions, function (field) {
                if (!field || metrics.indexOf(field) < 0) {
                    return;
                }

                newColumnPositions.push(field);
            });

            // merge
            columnPositions = newColumnPositions.concat(dimensions, metrics);
            columnPositions = _.uniq(columnPositions);

            // remove fields not in reports
            var reportFields = _.keys(reports[0]);
            angular.forEach(columnPositions, function (field) {
                if (reportFields.indexOf(field) < 0) {
                    columnPositions.splice(metrics.indexOf(field), 1);
                }
            });

            // approve
            $scope.columnPositions = columnPositions;
        }

        function _getDefaultSortField() {
            var metrics = _getFieldsFromShowInTotal($scope.reportView);
            if (!angular.isArray(metrics) || metrics.length < 1) {
                return null;
            }

            // sort alphabet
            metrics = _.sortBy(metrics);

            // get the first metric to sort
            var types = $scope.topPerformersUnifiedReportData.types;
            var sortField = null;
            angular.forEach(metrics, function (field) {
                if (!sortField && types[field] && (types[field] === 'number' || types[field] === 'decimal')) {
                    sortField = field;
                }
            });

            return sortField ? sortField : $scope.columnPositions[0];
        }

        function _sortUnifiedReports() {
            var orderBy = (!!$scope.reverseForUnifiedReport ? 'desc' : 'asc');
            var columnType = $scope.columnTypesForUnifiedReport[$scope.sortByForUnifiedReport];
            columnType = !columnType ? 'text' : columnType;

            // for date field only
            var dateFormat = false;
            if (columnType === 'date') {
                angular.forEach($scope.dateFieldFormatsForUnifiedReport, function (dateFieldFormat) {
                    if (!dateFieldFormat || !dateFieldFormat.field || !dateFieldFormat.format || dateFieldFormat.field !== $scope.sortByForUnifiedReport) {
                        return;
                    }

                    dateFormat = dateFieldFormat.format;
                });
            }

            // sort
            $scope.topPerformersUnifiedReportData.reports.sort(function (r1, r2) {
                if (!r1[$scope.sortByForUnifiedReport] || !r2[$scope.sortByForUnifiedReport]) {
                    return;
                }

                r1 = r1[$scope.sortByForUnifiedReport];
                r2 = r2[$scope.sortByForUnifiedReport];

                // sometime the value is string although the type is number, e.g "$ 2,236.34"
                // so, we remove non digit from value for this case
                if (columnType === 'number' || columnType === 'decimal') {
                    if (angular.isString(r1)) {
                        r1 = Number(NewDashboardUtil.removeNonDigit(r1));
                    }

                    if (angular.isString(r2)) {
                        r2 = Number(NewDashboardUtil.removeNonDigit(r2));
                    }
                } else if (columnType === 'date') {
                    if (dateFormat) {
                        r1 = _normalizeDatevalue(r1, dateFormat);
                        r2 = _normalizeDatevalue(r2, dateFormat);
                    }

                    // else: as string
                } else {
                    // string to lower to ignore case
                    r1 = r1.toLowerCase();
                    r2 = r2.toLowerCase();
                }

                if (r1 === r2) {
                    return 0;
                }

                return (r1 < r2)
                    ? (orderBy === 'desc' ? 1 : -1)
                    : (orderBy === 'desc' ? -1 : 1);
            });
        }

        function _normalizeDatevalue(dateValue, inputDateFormat) {
            if (!dateValue || !inputDateFormat) {
                return false;
            }

            return moment(dateValue, inputDateFormat).format('YYYY-MM-DD');
        }

        function _getFieldsFromShowInTotal(reportView) {
            if (!reportView || !reportView.showInTotal || !angular.isArray(reportView.showInTotal)) {
                return [];
            }
            var fields = [];

            angular.forEach(reportView.showInTotal, function (config) {
                if (!config || !config.fields || !angular.isArray(config.fields)) {
                    return;
                }

                fields = fields.concat(config.fields);
            });

            // unique
            fields = _.uniq(fields);

            return fields;
        }
    }
})();