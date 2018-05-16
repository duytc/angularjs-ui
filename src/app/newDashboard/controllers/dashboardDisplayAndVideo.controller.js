(function () {
    'use strict';

    angular.module('tagcade.newDashboard')
        .controller('DashboardDisplayAndVideo', DashboardDisplayAndVideo)
    ;

    function DashboardDisplayAndVideo($scope, _, $timeout, COMPARE_TYPE, DASHBOARD_TYPE, DateFormatter, Auth, DEFAULT_DATE_FIELD_DISPLAY_AND_VIDEO,
                                      DEFAULT_DATE_FORMAT, DisplayDashboardRestAngular, DISPLAY_REPORT_TYPES, CHART_FOLLOW, DISPLAY_SHOW_FIELDS,
                                      UnifiedReportDashboardRestAngular, VideoReportRestAngular, VIDEO_SHOW_FIELDS, ACCOUNT_STATISTICS, PLATFORM_STATISTICS,
                                      UnifiedReportViewManager, DASHBOARD_TYPE_JSON, NewDashboardUtil) {

        $scope.isAdmin = Auth.isAdmin();
        $scope.chartFollow = {
            type: CHART_FOLLOW['COMPARISION']
        };
        $scope.watchManager = {
            clickGetReport: false
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
            }
        };

        $scope.formData = {
            notifyComparisonDataChange: false,
            compareTypeData: {
                compareType: COMPARE_TYPE['yesterday'],
                label: NewDashboardUtil.getCompareLabel('yesterday')
            },
            comparisionData: [],
            dashboardTypes: [],
            masterReport: [],
            dateRange: {
                startDate: moment().add(1, 'days'),
                endDate: moment().add(1, 'days')
            },
            overviewData: {
                data: [],
                datePickerOpts: $scope.datePickerOpts
            },
            chartData: {
                notifyDrawChart: false,
                datePickerOpts: $scope.datePickerOpts,
                reports: [],
                currentReports: [],
                historyReports: [],
                dateField: DEFAULT_DATE_FIELD_DISPLAY_AND_VIDEO, // default for display and video, not for ur
                urData: {
                    fields: [],
                    fieldsLabel: {},
                    types: {}
                }
            },
            reportData: null,
            reportView: [],
            publisher: $scope.publisher
        };

        var _currentDashboardType = {
            id: null
        };

        $scope.onSelectDashboardType = onSelectDashboardType;
        $scope.isUnifiedReportDashboard = isUnifiedReportDashboard;
        $scope.onChangeChartFollow = onChangeChartFollow;

        $scope.$watch('formData.compareTypeData.compareType', _onCompareTypeDataChanged);
        $scope.$watch('formData.notifyComparisonDataChange', _onComparisionDataChanged);
        $scope.$watch('rootWatchManager.dashboardTypeChanged', _onDashboardTypeChanged);

        // _initData();

        /* scope functions ============================ */
        function isUnifiedReportDashboard(type) {
            return NewDashboardUtil.isUnifiedDashboard(type);
        }

        function isVideoDashboard(type) {
            return NewDashboardUtil.isVideoDashboard(type);
        }

        function isDisplayDashboard(type) {
            return NewDashboardUtil.isDisplayDashboard(type);
        }

        function create24Reports(report) {
            if (!report) {
                return [];
            }
            var hourReports = [];
            for (var hour = 0; hour < 24; hour++) {
                var hourReport = angular.copy(report);
                hourReport.date = hourReport.date + ' ' + hour;
                hourReports.push(hourReport)
            }
            return hourReports;
        }

        function isDayOverDayChart() {
            return $scope.formData.compareTypeData.compareType === COMPARE_TYPE['day'];
        }


        function _updateDisplayReportForChart(chartData) {
            var key = $scope.isAdmin ? PLATFORM_STATISTICS : ACCOUNT_STATISTICS;
            if (chartData) {
                var current;
                var history;
                if (isDayOverDayChart()) {
                    current = chartData.reportHourToday || [];
                    history = chartData.reportHourHistory || [];
                    $scope.formData.chartData.currentReports = current;
                    $scope.formData.chartData.historyReports = history;
                } else {
                    current = chartData.current || {};
                    history = chartData.history || {};
                    $scope.formData.chartData.currentReports = current[key] ? current[key].reports : [];
                    $scope.formData.chartData.historyReports = history[key] ? history[key].reports : [];
                }
                $scope.formData.chartData.dateField = {
                    field: DEFAULT_DATE_FIELD_DISPLAY_AND_VIDEO,
                    format: DEFAULT_DATE_FORMAT
                };
            }
        }

        function _updateVideoReportForChart(chartData) {
            if (chartData) {
                var current;
                var history;
                if (isDayOverDayChart()) {
                    current = chartData.reportHourToday || [];
                    history = chartData.reportHourHistory || [];
                    $scope.formData.chartData.currentReports = current;
                    $scope.formData.chartData.historyReports = history;
                } else {
                    current = chartData.current || {};
                    history = chartData.history || {};
                    $scope.formData.chartData.currentReports = current ? current.reports : [];
                    $scope.formData.chartData.historyReports = history ? history.reports : [];
                }
                $scope.formData.chartData.dateField = {
                    field: DEFAULT_DATE_FIELD_DISPLAY_AND_VIDEO,
                    format: DEFAULT_DATE_FORMAT
                };
            }
            console.log($scope.formData.chartData);
        }

        /**
         *
         * @param newComparisionData {current, history}
         */
        function onChangeChartFollow(newComparisionData) {
            console.log('onChangeChartFollow');
            var chartData;

            if (!newComparisionData) {
                return;
            }
            chartData = newComparisionData;

            if (isDisplayDashboard($scope.dashboardType)) {
                _updateDisplayReportForChart(chartData);
            }
            else if (isVideoDashboard($scope.dashboardType)) {
                _updateVideoReportForChart(chartData);
            }

            askForDrawingChart();

            $timeout(function () {
                //any code in here will automatically have an apply run afterwards
            });

            // if (!$scope.$$phase) {
            //     $scope.$apply();
            // }
        }

        function askForDrawingChart() {
            $scope.formData.chartData.notifyDrawChart = !$scope.formData.chartData.notifyDrawChart;
        }

        function onSelectDashboardType(dashboardType) {
            // check if no dashboardType selected. This is in case of login as publisher and has no module
            if (!dashboardType) {
                return;
            }
            // update current dashboard type
            _currentDashboardType = dashboardType;

            // reset default chartFollow to overview
            $scope.chartFollow = {
                type: CHART_FOLLOW['OVER_VIEW']
            };
            // _notifyChangeDashboardType();
        }

        function _notifyChangeDashboardType() {
            $scope.rootWatchManager.dashboardTypeChanged = !$scope.rootWatchManager.dashboardTypeChanged;
        }

        function _onCompareTypeDataChanged(newValue, oldValue, scope) {
            // console.log('comparison type change');
        }

        function _onComparisionDataChanged() {
            $scope.chartFollow.type = CHART_FOLLOW['COMPARISION'];
            onChangeChartFollow($scope.formData.comparisionData);
        }

        function _onDashboardTypeChanged() {
            onSelectDashboardType($scope.dashboardType);
        }

        function resetData() {
            $scope.formData.overviewData.data = [];
            $scope.formData.chartData.reports = [];
        }

        function _initData() {
            $scope.formData.overviewData.data = [];
            $scope.formData.topPerformersData = [];

            /* load dashboard data for current dashboard type */
            onSelectDashboardType($scope.dashboardType);
        }
    }
})();