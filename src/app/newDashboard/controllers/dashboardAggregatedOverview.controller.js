(function () {
    'use strict';

    angular.module('tagcade.newDashboard')
        .controller('DashboardAggregatedOverview', DashboardAggregatedOverview)
    ;

    function DashboardAggregatedOverview($scope, Auth, DASHBOARD_TYPE_JSON, COLUMNS_NAME_MAPPING_FOR_VIDEO_REPORT,
                                         $timeout, COMPARE_TYPE, videoReportService, ASC, reportRestangular, DESC,
                                         CHART_FOLLOW, ADMIN_DISPLAY_COMPARISION, PUBLISHER_DISPLAY_COMPARISION,
                                         DISPLAY_SHOW_FIELDS, unifiedReportComparisionRestangular, NewDashboardUtil, $translate) {
        $scope.isAdmin = Auth.isAdmin();

        $scope.resetOverviewData = resetOverviewData;
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
        $scope.customOverviewTableData = getCustomOverviewTableData();


        // ----------------------COMPARISION----------------------
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
                moment().subtract(1, 'days').format('YYYY-MM-DD'),
                moment().subtract(2, 'days').format('YYYY-MM-DD')
            ],
            currentDateRange: {
                startDate: $scope.datePickerOpts.ranges['Today'][0],
                endDate: $scope.datePickerOpts.ranges['Today'][0]
            },
            historyDateRange: {
                startDate: $scope.datePickerOpts.ranges['Yesterday'][0],
                endDate: $scope.datePickerOpts.ranges['Yesterday'][0]
            }
        };
        $scope.onChangeMode = onChangeMode;
        $scope.getRecentDay = getRecentDay;
        $scope.getPreviousDay = getPreviousDay;
        $scope.getCustomComparisonData = getCustomComparisonData;
        $scope.isValidCustomDateRange = isValidCustomDateRange;


        // _getData(false);

        $scope.$watch('dashboardType', function () {
            resetFormData();
            // reset to default
            $scope.compareTypeData.compareType = COMPARE_TYPE['yesterday'];

            _getData(false);
        });

        $scope.$watch('reportView', function () {
            // reset to default
            $scope.compareTypeData.compareType = COMPARE_TYPE['yesterday'];

            _getData(false);
        });
        //-----------------------------------------------------------------

        /* watch reportView changed, then render for unified report */
        // $scope.$watch('overviewData.data', _onOverviewDataChange);


        function getComparisonTableData() {
            var tableData = [];
            var current = $scope.formData.comparisionData.current;
            var history = $scope.formData.comparisionData.history;
            if(!current){
                current = {key: 'current'};
            }
            if(!history){
                history = {key: 'history'};
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
                return getRecentDay();
            }
            if (comparisonType === COMPARE_TYPE['custom']) {
                return currentOrHistoryText + ' (' + dateRangeString(dateRange) + ')';
            }
            if (comparisonType === COMPARE_TYPE['yesterday']) {
                return $translate.instant('NEW_DASHBOARD.YESTERDAY');
            }
            return  currentOrLastText + ' ' + $scope.compareTypeData.label;
        }

        function getCustomOverviewTableData() {
            var arr = [];
            arr.push($scope.customOverviewData);
            return arr;
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

        function resetOverviewData() {
            $scope.overviewData.data = [];
        }

        function _onOverviewDataChange() {
            $scope.customOverviewData = _refactorOverviewData();
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
            } else {
                if (!$scope.reportView) {
                    $scope.comparisionData = [];
                    $scope.formData.comparisionData = [];
                    return;
                }

                var param2 = {
                    masterReport: $scope.reportView.id,
                    type: $scope.compareTypeData.compareType
                };

                _getUnifiedComparision(param2, isClickChangeMode);
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

        function getExtraCustomDateRangeParameters(originalParam, param) {
            if (param.extraData) {
                originalParam.currentStartDate = param.extraData.current.startDate;
                originalParam.currentEndDate = param.extraData.current.endDate;
                originalParam.historyStartDate = param.extraData.history.startDate;
                originalParam.historyEndDate = param.extraData.history.endDate;
            }

            return originalParam;
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
            reportRestangular.one(route).get(json).then(function (data) {
                $scope.comparisionData = data;
                $scope.formData.comparisionData = _extractComparisionData(data, $scope.dashboardType);
                $scope.formData.comparisonTableData = getComparisonTableData();

                if (isClickChangeMode) {
                    _notifyDrawChart();
                }

            }, function (error) {
                $scope.comparisionData = [];
                $scope.formData.comparisionData = [];
            });
        }

        function _getUnifiedComparision(param, isClickChangeMode) {
            unifiedReportComparisionRestangular.one('comparison').customPOST(param).then(function (data) {
                $scope.comparisionData = data.plain();
                $scope.formData.comparisionData = _extractComparisionData(data, $scope.dashboardType);
                if (isClickChangeMode) {
                    _notifyDrawChart();
                }
            }, function (error) {
                $scope.comparisionData = [];
                $scope.formData.comparisionData = [];
            });
        }

        function getLabel(mode) {
            return NewDashboardUtil.getCompareLabel(mode);
        }

        function resetFormData() {
            // Empty data during the time waits for getting new data from api
            $scope.comparisionData = [];
            $scope.formData.comparisionData = [];
            $scope.formData.comparisonTableData = [];
        }

        function onChangeMode(mode) {
            console.log('onChangeMode');
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
            var customDateRange = extractCustomDateRange();
            console.log(customDateRange);
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
            if (DASHBOARD_TYPE_JSON['UNIFIED_REPORT'] === dashboardType.name) {
                return _extractUnifiedReportComparision(data);
            } else if (DASHBOARD_TYPE_JSON['VIDEO'] === dashboardType.name) {
                return _extractVideoComparision(data);
            } else {
                return _extractDisplayComparision(data);
            }
        }

        function _generateComparisonData(showFields, currentData, historyData, columns) {
            var returnData = [];
            for (var index = 0; index < showFields.length; index++) {
                var label = '';

                if (columns == null) {
                    label = NewDashboardUtil.getShowLabel(showFields[index]);
                } else {
                    label = columns[showFields[index]];
                }

                var json = {
                    label: label,
                    current: {
                        label: CURRENT_LABEL,
                        value: currentData == null || showFields[index] == null ? null : currentData[showFields[index]]
                    },
                    history: {
                        label: HISTORY_LABEL,
                        value: historyData == null || showFields[index] == null ? null : historyData[showFields[index]]
                    }
                };

                returnData.push(json);
            }

            if (NewDashboardUtil.isUnifiedDashboard($scope.dashboardType)) {
                // sort returnData for unified report
                var orderBy = ASC; // sort field name by alphabet asc
                var sortByForUnifiedReport = 'label';

                returnData.sort(function (r1, r2) {
                    if (r1[sortByForUnifiedReport] == r2[sortByForUnifiedReport]) {
                        return 0;
                    }
                    return (r1[sortByForUnifiedReport] < r2[sortByForUnifiedReport])
                        ? (orderBy === DESC ? 1 : -1)
                        : (orderBy === DESC ? -1 : 1);
                });
            }

            return returnData;
        }

        function _extractUnifiedReportComparision(data) {
            if (!data) {
                return [];
            }
            var showFields = getUnifiedShowFields(data);
            var currentData = data.current ? data.current.total : [];
            var historyData = data.history ? data.history.total : [];
            var columns = data.history ? data.history.columns : [];

            return _generateComparisonData(showFields, currentData, historyData, columns);
        }

        function getUnifiedShowFields(data) {
            if (!data) {
                return [];
            }
            var keys = [];
            if (data.current && data.current.total) {
                keys = Object.keys(data.current.total);
                if (keys && keys.length > 0) {
                    return keys;
                }
            }
            if (data.history && data.history.total) {
                keys = Object.keys(data.history.total);
                if (keys && keys.length > 0) {
                    return keys;
                }
            }
            return [];
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

            var key = $scope.isAdmin ? 'platformStatistics' : 'accountStatistics';
            return {
                current: data.current[key],
                history: data.history[key]
            };
        }

    }
})();