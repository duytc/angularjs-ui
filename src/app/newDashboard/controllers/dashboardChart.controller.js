(function () {
    'use strict';

    angular.module('tagcade.newDashboard')
        .controller('DashboardChart', DashboardChart)
    ;

    function DashboardChart($scope, $filter, Auth, DASHBOARD_TYPE_JSON, CHART_FOLLOW, COMPARE_TYPE, LINE_CHART_CONFIG,
                            DISPLAY_SHOW_FIELDS, VIDEO_SHOW_FIELDS, DASHBOARD_COLOR, NewDashboardUtil, CHART_DASH_TYPES) {
        const CURRENT_LABEL = 'Current';
        const HISTORY_LABEL = 'History';

        $scope.isAdmin = Auth.isAdmin();

        $scope.chartConfig = {};
        $scope.chartData.dateRange = angular.copy($scope.overviewDateRange);
        $scope.selectedDate = NewDashboardUtil.getStringDate($scope.chartData.dateRange);

        $scope.showChart = false;

        updateChart();

        $scope.$watch('chartData.notifyDrawChart', function (notifyDrawChart) {
            updateChart();
        }, true);

        /**
         * update chart
         */
        function updateChart() {
            // temp disable char when updating data
            $scope.showChart = false;

            // display chart again to fix zoom error
            setTimeout(function () {
                $scope.showChart = true;

                var data = {
                   currentReports: $scope.chartData.currentReports,
                   historyReports: $scope.chartData.historyReports
                };
                if (DASHBOARD_TYPE_JSON['DISPLAY'] === $scope.dashboardType.name) {
                    // sort by date field
                    data.currentReports = sort(getDateKey(), data.currentReports);
                    data.historyReports = sort(getDateKey(), data.historyReports);
                    $scope.chartConfig = _getChartConfig(data);

                } else if (DASHBOARD_TYPE_JSON['VIDEO'] === $scope.dashboardType.name) {
                    // sort by date field
                    data.currentReports = sort(getDateKey(), data.currentReports);
                    data.historyReports = sort(getDateKey(), data.historyReports);
                    $scope.chartConfig = _getChartConfig(data);

                } else if (DASHBOARD_TYPE_JSON['UNIFIED_REPORT'] === $scope.dashboardType.name) {
                    // no need sort, already sorted by date
                    $scope.chartConfig = _getChartConfig(data);
                }
            }, 0);
        }

        function getShowFields(dashboardType) {
            if (DASHBOARD_TYPE_JSON['DISPLAY'] === dashboardType.name)
                return DISPLAY_SHOW_FIELDS;
            if (DASHBOARD_TYPE_JSON['VIDEO'] === dashboardType.name)
                return VIDEO_SHOW_FIELDS;
            if (DASHBOARD_TYPE_JSON['UNIFIED_REPORT'] === dashboardType.name)
                return $scope.chartData.urData.fields;

        }

        function getLabelForChart(field, dashboardType) {
            if (DASHBOARD_TYPE_JSON['UNIFIED_REPORT'] === dashboardType.name) {
                return $scope.chartData.urData.fieldsLabel[field];
            } else {
                return NewDashboardUtil.getShowLabel(field);
            }
        }

        function getDateKey() {
            if (!$scope.chartData || !$scope.chartData.dateField || !$scope.chartData.dateField.field) {
                return false;
            }

            return $scope.chartData.dateField.field;
        }

        function getDateFormat() {
            if (!$scope.chartData || !$scope.chartData.dateField || !$scope.chartData.dateField.format) {
                return false;
            }

            return $scope.chartData.dateField.format;
        }

        function normalizeDatevalue(dateValue, inputDateFormat) {
            if (!dateValue || !inputDateFormat) {
                return false;
            }

            return moment(dateValue, inputDateFormat).format('YYYY-MM-DD');
        }

        function isInDateRange(date, selectedDate) {
            // temp not support custom date range from chart panel, use date from overview date range
            // TODO: remove all code related to date range from chart panel...
            if (1 == 1) {
                return true;
            }

            if (!selectedDate) return true;
            var startDate = selectedDate.startDate;
            var endDate = selectedDate.endDate;

            if (startDate && endDate && date <= endDate && date >= startDate) return true;
            if (!startDate && endDate && date <= endDate) return true;
            if (startDate && !endDate && date >= startDate) return true;

            return false;
        }

        function getChartConfigData(reports, xAxis, showFields, seriesLabel, dashType) {
            var chartConfigData = {
                xAxisData: [],
                series: []
            };
            var dates = [];
            var showData = {};
            var dateKey = getDateKey();
            var dateFormat = getDateFormat();

            angular.forEach(reports, function (report) {
                var dateValue = report[dateKey];
                // normalize dateValue to standard format "Y-m-d" for comparison date range
                dateValue = normalizeDatevalue(dateValue, dateFormat);

                if (isInDateRange(dateValue, $scope.selectedDate)) {
                    dates.push(dateValue); // dates.push($filter('date')(dateValue));
                    angular.forEach(showFields, function (field) {
                        if (!showData[field]) {
                            showData[field] = [];
                        }

                        var digitOnly = NewDashboardUtil.removeNonDigit(report[field]);
                        digitOnly = digitOnly ? digitOnly : 0;
                        showData[field].push(Number(digitOnly));
                    });
                }
            });

            var chartSeries = [];
            var index = 0;
            angular.forEach(showFields, function (field) {
                var oneSeries = {
                    name: seriesLabel + ' ' + getLabelForChart(field, $scope.dashboardType),
                    data: showData[field],
                    connectNulls: true,
                    color: DASHBOARD_COLOR[index],
                    visible: _getVisibleForField(field),
                    dashStyle: dashType
                };
                if(xAxis){
                    oneSeries.xAxis = xAxis;
                }
                index++;
                chartSeries.push(oneSeries);
            });
            chartConfigData.xAxisData = dates;
            chartConfigData.series = chartSeries;
            return chartConfigData;
        }

        /**
         * @param reportDetails list of reports to draw chart
         * @returns {*}
         */
        function _getChartConfig(reportDetails) {
            if (!reportDetails) {
                return null;
            }
            var currentReports = reportDetails.currentReports;
            var historyReports = reportDetails.historyReports;

            if((!currentReports && !historyReports) || (currentReports.length === 0 && historyReports.length === 0)){
                return null;
            }

            var showFields = getShowFields($scope.dashboardType);
            if (!showFields || showFields.length === 0) {
                // skip drawing chart without any show fields
                return null;
            }

            var chartConfig =  LINE_CHART_CONFIG;
            var currentChartConfig = getChartConfigData(currentReports, 1, showFields, CURRENT_LABEL, CHART_DASH_TYPES.SOLID);
            var historyChartConfig = getChartConfigData(historyReports, null, showFields, HISTORY_LABEL, CHART_DASH_TYPES.LONG_DASH);

            chartConfig.xAxis[0].categories = historyChartConfig.xAxisData;
            chartConfig.xAxis[1].categories = currentChartConfig.xAxisData;

            chartConfig.series = currentChartConfig.series.concat(historyChartConfig.series);
            return chartConfig;
        }

        function _getVisibleForField(field) {
            if (DASHBOARD_TYPE_JSON['UNIFIED_REPORT'] === $scope.dashboardType.name) {
                return true;
            }

            if (DASHBOARD_TYPE_JSON['DISPLAY'] === $scope.dashboardType.name) {
                return field != 'fillRate'; // default hide for "fillRate"
            }

            if (DASHBOARD_TYPE_JSON['VIDEO'] === $scope.dashboardType.name) {
                return field != 'requestFillRate'; // default hide for "requestFillRate"
            }
        }

        function sort(columnName, unsortedData) {
            var type = 'asc';
            var sortedData = angular.copy(unsortedData);
            if (sortedData)
                sortedData.sort(compareValues(columnName, type));

            return sortedData;
        }

        // function for dynamic sorting
        function compareValues(key, order) {
            return function (a, b) {
                if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
                    // property doesn't exist on either object
                    return 0;
                }

                const varA = (typeof a[key] === 'string') ?
                    a[key].toUpperCase() : a[key];
                const varB = (typeof b[key] === 'string') ?
                    b[key].toUpperCase() : b[key];

                var comparison = 0;
                if (varA > varB) {
                    comparison = 1;
                } else if (varA < varB) {
                    comparison = -1;
                }
                return (
                    (order == 'desc') ? (comparison * -1) : comparison
                );
            };
        }
    }
})();