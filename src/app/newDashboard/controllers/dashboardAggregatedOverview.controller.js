(function () {
    'use strict';

    angular.module('tagcade.newDashboard')
        .controller('DashboardAggregatedOverview', DashboardAggregatedOverview)
    ;

    function DashboardAggregatedOverview($scope, Auth, DASHBOARD_TYPE_JSON, COLUMNS_NAME_MAPPING_FOR_VIDEO_REPORT, PLATFORM_STATISTICS,
                                         $timeout, COMPARE_TYPE, videoReportService, ASC, reportRestangular, DESC, ACCOUNT_STATISTICS,
                                         CHART_FOLLOW, ADMIN_DISPLAY_COMPARISION, PUBLISHER_DISPLAY_COMPARISION, DEFAULT_DATE_FORMAT,
                                         DISPLAY_SHOW_FIELDS, unifiedReportComparisionRestangular, NewDashboardUtil, $translate) {
        $scope.isAdmin = Auth.isAdmin();

        $scope.isShowForUnifiedReport = isShowForUnifiedReport;
        $scope.isShowForDisplayReport = isShowForDisplayReport;
        $scope.isShowForVideoReport = isShowForVideoReport;
        $scope.hasDisplayOverviewTable = hasDisplayOverviewTable;
        $scope.hasDisplayComparisonTable = hasDisplayComparisonTable;
        $scope.hasVideoOverviewTable = hasVideoOverviewTable;
        $scope.hasVideoComparisonTable = hasVideoComparisonTable;
        $scope.dateRangeString = dateRangeString;
        $scope.columnNameMappingForVideoReport = COLUMNS_NAME_MAPPING_FOR_VIDEO_REPORT;
        $scope.customOverviewData = _refactorOverviewData();
        // ----------------------COMPARISION----------------------

        $scope.helpTextVisibilityStatus = true;
        $scope.showLoading = false;
        $scope.comparisonConst = {
            CUSTOM: 'custom'
        };
        $scope.alertMessage = {
            isShow: false,
            content: ''
        };
        $scope.datePickerOpts = {
            maxDate: moment().endOf('day'),
            ranges: {
                'Today': [moment().startOf('day'), moment().endOf('day')],
                'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                'Last 7 Days': [moment().subtract(7, 'days'), moment().subtract(1, 'days')], // note: from yesterday
                'Last 30 Days': [moment().subtract(30, 'days'), moment().subtract(1, 'days')], // note: from yesterday
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            },
            opens: 'right'
        };

        const CURRENT_LABEL = 'current';
        const HISTORY_LABEL = 'history';

        $scope.formData = {
            comparisonTableData: [],
            comparisionData: $scope.compareTypeData,
            dayValuesForDayOverDay: [
                moment().format(DEFAULT_DATE_FORMAT),
                moment().subtract(1, 'days').format(DEFAULT_DATE_FORMAT)
            ],
            currentDateRange: {
                startDate: moment().subtract(14, 'days'),
                endDate: moment().subtract(1, 'days')
            },
            historyDateRange: {
                startDate: moment().subtract(28, 'days'),
                endDate: moment().subtract(15, 'days')
            }
        };
        $scope.onChangeMode = onChangeMode;
        $scope.getRecentDay = getRecentDay;
        $scope.getPreviousDay = getPreviousDay;
        $scope.getCustomComparisonData = getCustomComparisonData;
        $scope.isValidCustomDateRange = isValidCustomDateRange;
        $scope.isYesterdayType = isYesterdayType;

        $scope.$watch('rootWatchManager.dashboardTypeChanged', _onDashboardTypeChanged);

        function _onDashboardTypeChanged() {
            resetFormData();
            $scope.compareTypeData.compareType = COMPARE_TYPE['yesterday'];
            _getData(false);
        }

        function getComparisonTableData() {
            var tableData = [];
            var current = $scope.formData.comparisionData.current;
            var history = $scope.formData.comparisionData.history;
            if (!current) {
                current = {key: CURRENT_LABEL};
            }
            if (!history) {
                history = {key: HISTORY_LABEL};
            }

            current.dateRange = $scope.formData.currentDateRange;
            current.label = getLabelByComparisonType($scope.compareTypeData.compareType, true, current.dateRange);

            history.dateRange = $scope.formData.historyDateRange;
            history.label = getLabelByComparisonType($scope.compareTypeData.compareType, false, history.dateRange);

            //push to array
            tableData.push(current);
            if ($scope.compareTypeData.compareType !== COMPARE_TYPE['yesterday']) {
                tableData.push(history);
            }

            return tableData;
        }

        function getLabelByComparisonType(comparisonType, isCurrentNotHistory, dateRange) {
            var currentOrHistoryText = isCurrentNotHistory ? $translate.instant('NEW_DASHBOARD.CURRENT') : $translate.instant('NEW_DASHBOARD.HISTORY');
            var currentOrLastText = isCurrentNotHistory ? $translate.instant('NEW_DASHBOARD.CURRENT') : $translate.instant('NEW_DASHBOARD.LAST');

            if (comparisonType === COMPARE_TYPE['day']) {
                if (isCurrentNotHistory) {
                    return getRecentDay();
                } else {
                    return getPreviousDay();
                }
            }
            if (comparisonType === COMPARE_TYPE['custom']) {
                return currentOrHistoryText + ' (' + dateRangeString(dateRange) + ')';
            }
            if (comparisonType === COMPARE_TYPE['yesterday']) {
                return $translate.instant('NEW_DASHBOARD.YESTERDAY');
            }
            return currentOrLastText + ' ' + $scope.compareTypeData.label;
        }

        function hasVideoOverviewTable() {
            return isShowForVideoReport() && $scope.overviewData.data;
        }

        function hasVideoComparisonTable() {
            return isShowForVideoReport() && $scope.formData.comparisionData;
        }

        function hasDisplayOverviewTable() {
            return isShowForDisplayReport() && $scope.overviewData.data;
        }

        function hasDisplayComparisonTable() {
            return isShowForDisplayReport() && $scope.formData.comparisionData;
        }

        function isValidCustomDateRange() {
            var customDateRange = extractCustomDateRange();
            if (!customDateRange) {
                return false;
            }
            return customDateRange.current.startDate > customDateRange.history.endDate;

        }

        function getStringDate(date) {
            return NewDashboardUtil.getStringDate(date);
        }

        function dateRangeString(date) {
            var dateRange = getStringDate(date);
            if (dateRange) {
                return dateRange.startDate + ' - ' + dateRange.endDate;
            }
            return '';
        }

        function _refactorOverviewData() {
            var data = angular.copy($scope.overviewData.data);

            if (!isShowForUnifiedReport()) {
                return data;
            }

            // sort data for unified report
            var orderBy = ASC; // sort field name by alphabet asc
            var sortByForUnifiedReport = 'label';
            data.sort(function (r1, r2) {
                if (r1[sortByForUnifiedReport] == r2[sortByForUnifiedReport]) {
                    return 0;
                }

                return (r1[sortByForUnifiedReport] < r2[sortByForUnifiedReport])
                    ? (orderBy == DESC ? 1 : -1)
                    : (orderBy == DESC ? -1 : 1);
            });

            return data;
        }

        /* all scope functions ===================== */
        function isShowForUnifiedReport() {
            if (!$scope.dashboardType || !$scope.dashboardType.id) {
                return false;
            }

            return DASHBOARD_TYPE_JSON[$scope.dashboardType.id] === DASHBOARD_TYPE_JSON.UNIFIED_REPORT;
        }

        function isShowForDisplayReport() {
            if (!$scope.dashboardType || !$scope.dashboardType.id) {
                return false;
            }

            return DASHBOARD_TYPE_JSON[$scope.dashboardType.id] === DASHBOARD_TYPE_JSON.DISPLAY;
        }

        function isShowForVideoReport() {
            if (!$scope.dashboardType || !$scope.dashboardType.id) {
                return false;
            }

            return DASHBOARD_TYPE_JSON[$scope.dashboardType.id] === DASHBOARD_TYPE_JSON.VIDEO;
        }


        //-------------_COMPARISION-------------------
        function _notifyDrawChart() {
            if ($scope.chartFollow.type !== CHART_FOLLOW['COMPARISION']) {
                $scope.chartFollow.type = CHART_FOLLOW['COMPARISION'];
            }
            $timeout(function () {
                $scope.onChangeChartFollow();
            }, 0);

        }

        function getRecentDay() {
            return $scope.formData.dayValuesForDayOverDay[0];
        }

        function getPreviousDay() {
            return $scope.formData.dayValuesForDayOverDay[1];
        }

        function _getData(isClickChangeMode, customDateRange) {
            var param = {
                type: $scope.compareTypeData.compareType,
                extraData: customDateRange
            };

            if ($scope.dashboardType.id === 'DISPLAY') {
                _getDisplayComparision(param, isClickChangeMode);
            } else if ($scope.dashboardType.id === 'VIDEO') {
                _getVideoComparision(param, isClickChangeMode);
            }
        }

        function _getVideoComparision(param, isClickChangeMode) {
            var apiParams = getExtraCustomDateRangeParameters({type: $scope.compareTypeData.compareType}, param);
            videoReportService.getComparision(apiParams).then(function (data) {
                $scope.comparisionData = data;
                $scope.formData.comparisionData = _extractComparisionData(data, $scope.dashboardType);

                if (isClickChangeMode) {
                    _notifyDrawChart();
                }
            }, function (error) {
                $scope.comparisionData = [];
                $scope.formData.comparisionData = [];
            });
        }

        function _getDisplayComparision(param, isClickChangeMode) {
            var json = {
                type: $scope.compareTypeData.compareType
            };
            json = getExtraCustomDateRangeParameters(json, param);
            var route;
            if ($scope.isAdmin) {
                route = ADMIN_DISPLAY_COMPARISION;
            } else {
                route = PUBLISHER_DISPLAY_COMPARISION + '/' + $scope.publisher.id;
            }
            $scope.showLoading = true;
            reportRestangular.one(route).get(json).then(function (data) {
                $scope.comparisionData = data; //???
                $scope.formData.comparisionData = _extractComparisionData(data, $scope.dashboardType);
                $scope.formData.comparisonTableData = getComparisonTableData();
                $scope.showLoading = false;
                notifyComparisonDataChanged();

                if (isClickChangeMode) {
                    _notifyDrawChart();
                }

            }, function (error) {
                $scope.comparisionData = [];
                $scope.formData.comparisionData = [];
                $scope.formData.comparisonTableData = [];
                $scope.showLoading = false;
            });
        }

        function getExtraCustomDateRangeParameters(originalParam, param) {
            if (param.extraData) {
                originalParam.currentStartDate = param.extraData.current.startDate;
                originalParam.currentEndDate = param.extraData.current.endDate;
                originalParam.historyStartDate = param.extraData.history.startDate;
                originalParam.historyEndDate = param.extraData.history.endDate;
            }

            return originalParam;
        }

        function notifyComparisonDataChanged() {
            $scope.notifyComparisonDataChange = !$scope.notifyComparisonDataChange;
        }



        function getLabel(mode) {
            return NewDashboardUtil.getCompareLabel(mode);
        }

        function resetFormData() {
            // Empty data during the time waits for getting new data from api
            $scope.comparisionData = [];
            $scope.formData.comparisionData = [];
            // Build fake data for comparison table so that table still appears
            $scope.formData.comparisonTableData = null;
        }

        function isYesterdayType() {
            return $scope.compareTypeData.compareType === COMPARE_TYPE['yesterday'];
        }

        function onChangeMode(mode) {
            if ($scope.compareTypeData.compareType === COMPARE_TYPE[mode]) {
                //return if mode not change
                return;
            }
            resetFormData();

            $scope.compareTypeData.compareType = COMPARE_TYPE[mode];
            $scope.compareTypeData.label = getLabel(mode);
            if (mode !== $scope.comparisonConst.CUSTOM) {
                _getData(true);
            } else {
                getCustomComparisonData();
            }
        }

        function getCustomComparisonData() {
            resetFormData();
            $scope.watchManager.clickGetReport = !$scope.watchManager.clickGetReport;
            var customDateRange = extractCustomDateRange();
            if (customDateRange) {
                _getData(true, customDateRange);
            }
        }

        function extractCustomDateRange() {
            var current = NewDashboardUtil.getStringDate($scope.formData.currentDateRange);
            var history = NewDashboardUtil.getStringDate($scope.formData.historyDateRange);
            if (current && history) {
                return {
                    current: current,
                    history: history
                };
            }
            return null;
        }

        function _extractComparisionData(data, dashboardType) {
            if (DASHBOARD_TYPE_JSON['VIDEO'] === dashboardType.name) {
                return _extractVideoComparision(data);
            } else {
                return _extractDisplayComparision(data);
            }
        }

        function _extractVideoComparision(data) {
            if (!data || !data.current || !data.history) {
                return [];
            }

            return data;
        }

        function _extractDisplayComparision(data) {
            if (!data) {
                return [];
            }

            var key = $scope.isAdmin ? PLATFORM_STATISTICS : ACCOUNT_STATISTICS;
            return {
                current: data.current[key],
                history: data.history[key]
            };
        }

    }
})();