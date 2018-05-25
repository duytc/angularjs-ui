(function () {
    'use strict';

    angular.module('tagcade.newDashboard')
        .controller('DashboardChart', DashboardChart)
    ;

    function DashboardChart($scope, $filter, Auth, DASHBOARD_TYPE_JSON, COMPARE_TYPE, LINE_CHART_CONFIG,DESC,ASC, HOUR_EXTENSION,
                            DISPLAY_SHOW_FIELDS, VIDEO_SHOW_FIELDS, VIDEO_SHOW_FIELDS_PUBLISHER,DISPLAY_SHOW_FIELDS_PUBLISHER, DASHBOARD_COLOR, NewDashboardUtil, CHART_DASH_TYPES, DEFAULT_DATE_FORMAT) {
        const CURRENT_LABEL = 'Current';
        const HISTORY_LABEL = 'Historical';
        const HOUR = 'hour';

        $scope.isAdmin = Auth.isAdmin();

        $scope.chartConfig = angular.copy(LINE_CHART_CONFIG);
        $scope.chartData.dateRange = angular.copy($scope.overviewDateRange);
        $scope.selectedDate = NewDashboardUtil.getStringDate($scope.chartData.dateRange);

        $scope.showChart = false;

        updateChart();

        $scope.$watch('chartData.notifyDrawChart', function () {
            updateChart();
        }, true);

        $scope.$watch('compareTypeData.compareType', _onComparisionTypeDataChange);
        $scope.$watch('watchManager.clickGetReport', _onClickGetReport);

        function _onClickGetReport() {
            showChartLoading();
        }

        function showChartLoading() {
            $scope.chartConfig = {
                options: {
                    title: {
                        text: 'Loading chart...'
                    }
                }
            };
        }

        function _onComparisionTypeDataChange() {
            showChartLoading();
        }
        /**
         * each day over day report has dateTime field : example {dateTime: '2018-12-22 23'}
         * Add each report hour property {hour: 23}
         * @param reports
         */
        function separateDateAndHour(reports) {
            if (!reports || !isDayOverDayChart()) {
                return;
            }
            var dateKey = 'dateTime';
            angular.forEach(reports, function (report) {
                var dateTime = report[dateKey];
                if(isDayOverDayChart()){
                    var time = NewDashboardUtil.getTimeFromDateTime(dateTime);
                    report[HOUR] = Number(time);
                }
            })
        }

        /**
         * update chart
         */
        function updateChart() {
            // temp disable char when updating data
            $scope.showChart = false;

            // display chart again to fix zoom error
            setTimeout(function () {
                $scope.showChart = true;
                var softField = null;
                var data = {
                   currentReports: $scope.chartData.currentReports,
                   historyReports: $scope.chartData.historyReports
                };
                if (DASHBOARD_TYPE_JSON['DISPLAY'] === $scope.dashboardType.name) {
                    separateDateAndHour(data.currentReports);
                    separateDateAndHour(data.historyReports);
                    // sort by date field
                    softField = getSortField();
                    data.currentReports = sortAsc(softField, data.currentReports);
                    data.historyReports = sortAsc(softField, data.historyReports);

                    $scope.chartConfig = _getChartConfig(data);

                } else if (DASHBOARD_TYPE_JSON['VIDEO'] === $scope.dashboardType.name) {
                    separateDateAndHour(data.currentReports);
                    separateDateAndHour(data.historyReports);
                    // sort by date field
                    softField = getSortField();
                    data.currentReports = sortAsc(softField, data.currentReports);
                    data.historyReports = sortAsc(softField, data.historyReports);

                    $scope.chartConfig = _getChartConfig(data);
                }
            }, 0);
        }

        function isDayOverDayChart() {
            return $scope.compareTypeData.compareType === COMPARE_TYPE['day'];
        }

        /**
         * return HOUR const value for day over day, and return date or another dateField for other comparison type
         * @returns {string}
         */
        function getSortField() {
            var sortField = HOUR;
            if(!isDayOverDayChart()){
                sortField = getDateKey();
            }
            return sortField;
        }

        function getShowFields(dashboardType) {
            if (DASHBOARD_TYPE_JSON['DISPLAY'] === dashboardType.name){
                if(Auth.isAdmin()){
                    return DISPLAY_SHOW_FIELDS;
                }
                return DISPLAY_SHOW_FIELDS_PUBLISHER;
            }

            if (DASHBOARD_TYPE_JSON['VIDEO'] === dashboardType.name){
                if (Auth.isAdmin()) {
                    return VIDEO_SHOW_FIELDS;
                }
                return VIDEO_SHOW_FIELDS_PUBLISHER;
            }

        }

        function getLabelForChart(field, dashboardType) {
            return NewDashboardUtil.getShowLabel(field);
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

            return moment(dateValue, inputDateFormat).format(DEFAULT_DATE_FORMAT);
        }

        /**
         * @param reports list of reports
         * @param xAxis : null or 1
         * @param showFields : fields of report need to be displayed
         * @param seriesLabel : current or historical
         * @param dashType : style of lines
         * @returns {{xAxisData: Array, series: Array}}
         */
        function getChartConfigData(reports, xAxis, showFields, seriesLabel, dashType) {
            var chartConfigData = {
                xAxisData: [],
                series: []
            };

            var chartCategories = []; // data for x axis
            var showData = {};
            var dateKey = getDateKey();
            var dateFormat = getDateFormat();
            var xAxisField = isDayOverDayChart() ? HOUR : dateKey;

            angular.forEach(reports, function (report) {
                var category = '';
                if(isDayOverDayChart()){
                    category = report[xAxisField] + HOUR_EXTENSION;
                }else {
                    var date = report[xAxisField];
                    // normalize dateValue to standard format "Y-m-d" for comparison date range
                    category = normalizeDatevalue(date, dateFormat);
                }

                chartCategories.push(category);
                angular.forEach(showFields, function (field) {
                    if (!showData[field]) {
                        showData[field] = [];
                    }

                    var digitOnly = NewDashboardUtil.removeNonDigit(report[field]);
                    digitOnly = digitOnly ? digitOnly : 0;
                    showData[field].push(Number(digitOnly));
                });
            });

            //build chart series
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
            chartConfigData.xAxisData = chartCategories;
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
            var historyChartConfig = getChartConfigData(historyReports, null, showFields, HISTORY_LABEL, CHART_DASH_TYPES.SHORT_DASH);

            chartConfig.xAxis[0].categories = historyChartConfig.xAxisData;
            chartConfig.xAxis[1].categories = currentChartConfig.xAxisData;

            chartConfig.series = currentChartConfig.series.concat(historyChartConfig.series);
            return chartConfig;
        }

        function _getVisibleForField(field) {
            if (DASHBOARD_TYPE_JSON['DISPLAY'] === $scope.dashboardType.name) {
                return field !== 'fillRate'; // default hide for "fillRate"
            }

            if (DASHBOARD_TYPE_JSON['VIDEO'] === $scope.dashboardType.name) {
                return field !== 'requestFillRate'; // default hide for "requestFillRate"
            }
        }

        function sortAsc(columnName, unsortedData) {
            var type = ASC;
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
                    (order === DESC) ? (comparison * -1) : comparison
                );
            };
        }
    }
})();