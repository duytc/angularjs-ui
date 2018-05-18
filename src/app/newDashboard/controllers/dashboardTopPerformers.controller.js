(function () {
    'use strict';

    angular.module('tagcade.newDashboard')
        .controller('DashboardTopPerformers', DashboardTopPerformers)
    ;

    function DashboardTopPerformers($scope, _, dashboard, videoReportService, dataService, Auth, NewDashboardUtil, DEFAULT_DATE_FORMAT, DESC, ASC,
                                    DASHBOARD_TYPE_JSON, REPORT_SETTINGS, API_PERFORMANCE_UNIFIED_REPORTS_BASE_URL, COLUMNS_NAME_MAPPING_FOR_VIDEO_REPORT) {
        $scope.userSession = Auth.getSession();
        $scope.isAdmin = Auth.isAdmin();
        $scope.showLoading = false;
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

        $scope.isShowForDisplay = isShowForDisplay;
        $scope.isShowForVideo = isShowForVideo;
        $scope.showPagination = showPagination;
        $scope.hasKeyObjectForVideoReport = hasKeyObjectForVideoReport;
        $scope.getSortIconClass = getSortIconClass;
        $scope.onClickSortForVideo = onClickSortForVideo;
        $scope.isShowSortIconForVideoReport = isShowSortIconForVideoReport;

        $scope.showPaginationForUnifiedReport = showPaginationForUnifiedReport;
        $scope.isShowFieldForUnifiedReport = isShowFieldForUnifiedReport;
        $scope.isNullValue = isNullValue;

        /* watch dashboard type changed, then render for display or video or unified report */
        // $scope.$watch('dashboardType', _onDashBoardTypeChange);
        // $scope.$watch('rootWatchManager.dashboardTypeChanged', _onDashBoardTypeChange);

        /* watch dateRange changed, then re-get data for display or video or unified report */
        $scope.$watch('dateRange', _onDateRangeChange);

        $scope.$watch('comparisionData', _onComparisionDataChange);

        $scope.$watch('compareTypeData.compareType', _onComparisionTypeDataChange);

        $scope.$watch('watchManager.clickGetReport', _onClickGetReport);

        /* all scope functions ===================== */
        function isShowForDisplay() {
            return DASHBOARD_TYPE_JSON[$scope.dashboardType.id] === DASHBOARD_TYPE_JSON.DISPLAY;
        }

        function isShowForVideo() {
            return DASHBOARD_TYPE_JSON[$scope.dashboardType.id] === DASHBOARD_TYPE_JSON.VIDEO;
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

        function isShowFieldForUnifiedReport(sortColumn) {
            return ($scope.sortByForUnifiedReport === sortColumn)
        }

        function isNullValue(report, column) {
            return !report[column] && report[column] !== 0;
        }

        /* all local functions ===================== */

        function _onClickGetReport() {
            resetTopPerformerData();
            $scope.showLoading = true;
        }

        function _onComparisionTypeDataChange() {
            resetTopPerformerData();
            $scope.showLoading = true;
        }

        function resetTopPerformerData() {
            $scope.topPerformersData.topAdNetworks = [];
            $scope.topPerformersData.topPublishers = [];
            $scope.topPerformersData.topSites = [];
            $scope.topPerformersVideoData.reports = [];
        }

        function _onComparisionDataChange() {
            if (!$scope.comparisionData || $scope.comparisionData.length === 0) return;
            var dateRange = {
                startDate: $scope.comparisionData.startEndDateCurrent.startDate,
                endDate: $scope.comparisionData.startEndDateCurrent.endDate
            };
            _updateToPerformanceData(dateRange);

        }

        function _updateToPerformanceData(dateRange) {
            if (isShowForDisplay()) {
                _updateTopPerformersForDisplay(dateRange);
            }
            if (isShowForVideo()) {
                _updateTopPerformersForVideo(dateRange);
            }
        }

        function _onDateRangeChange(newValue, oldValue, scope) {
            if (!NewDashboardUtil.isDifferentDate(newValue, oldValue)) {
                return; // ignore if date range not change. Case: move cursor in date range picker value
            }

            if (isShowForDisplay()) {
                _updateTopPerformersForDisplay();
            }

            if (isShowForVideo()) {
                _updateTopPerformersForVideo();
            }
        }

        function _updateTopPerformersForDisplay(dateRange) {
            var params = {
                startDate: !dateRange ? null : dateRange.startDate,
                endDate: !dateRange ? null : dateRange.endDate
            };

            $scope.showLoading = true;

            if ($scope.isAdmin) {
                dashboard.getPlatformDashboard(params, $scope.userSession)
                    .then(function (data) {
                            $scope.topPerformersData = data;
                            $scope.showLoading = false;
                        },
                        function (error) {
                            $scope.topPerformersData = {
                                topPublishers: [],
                                topSites: [],
                                topAdNetworks: []
                            };
                            $scope.showLoading = false;
                        }
                    );
            } else {
                params = $.extend(params, {id: $scope.userSession.id});
                dashboard.getPublisherDashboard(params, $scope.userSession)
                    .then(function (data) {
                            $scope.topPerformersData = data;
                            $scope.showLoading = false;
                        },
                        function (error) {
                            $scope.topPerformersData = {
                                topPublishers: [],
                                topSites: [],
                                topAdNetworks: []
                            };
                            $scope.showLoading = false;
                        }
                    );
            }
        }

        function _updateTopPerformersForVideo(dateRange) {
            var params = {};
            if (dateRange) {
                params.startDate = dateRange.startDate;
                params.endDate = dateRange.endDate;
            }

            $scope.queryParams.filters.startDate = params.startDate;
            $scope.queryParams.filters.endDate = params.endDate;

            params.metrics = angular.toJson($scope.queryParams.metrics);
            params.filters = angular.toJson($scope.queryParams.filters);
            params.breakdowns = angular.toJson($scope.queryParams.breakdowns);

            videoReportService.getPulsePoint(params)
                .then(function (data) {
                    $scope.topPerformersVideoFullData = data;

                    /* sort data */
                    _sortVideoReport();
                    $scope.showLoading = false;
                })
                .catch(function (error) {
                    $scope.topPerformersVideoData = {
                        reports: []
                    };
                    $scope.showLoading = false;
                })
            ;
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
                    ? ($scope.sortOrderForVideo === DESC ? 1 : -1)
                    : ($scope.sortOrderForVideo === DESC ? -1 : 1);
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
    }
})();