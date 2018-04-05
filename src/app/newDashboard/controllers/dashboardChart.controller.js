(function () {
    'use strict';

    angular.module('tagcade.newDashboard')
        .controller('DashboardChart', DashboardChart)
    ;

    function DashboardChart($scope, $filter, Auth, DASHBOARD_TYPE_JSON, CHART_FOLLOW, COMPARE_TYPE,
                            DISPLAY_SHOW_FIELDS, VIDEO_SHOW_FIELDS, DASHBOARD_COLOR, NewDashboardUtil) {
        $scope.isAdmin = Auth.isAdmin();

        $scope.chartConfig = {};
        $scope.selectedDate = null; //type string
        $scope.chartData.dateRange = angular.copy($scope.overviewDateRange);

        $scope.showChart = false;

        $scope.onDateApply = onDateApply;

        updateChart(false);

        $scope.$watch('chartData.reports', function (newValue, oldValue, scope) {
            updateDateRange();
            updateChart(false);
        }, true);

        $scope.$watch('chartData.dateRange', _onDateRangeChange);

        function updateDateRange() {
            $scope.chartData.dateRange = angular.copy($scope.overviewDateRange);
            if ($scope.chartFollow.type !== CHART_FOLLOW['COMPARISION'])
                return;

            var dateValue = [];
            if ($scope.compareTypeData.compareType === COMPARE_TYPE['day']) {
                dateValue = NewDashboardUtil.getTodayDateRange();
            } else if ($scope.compareTypeData.compareType === COMPARE_TYPE['week']) {
                dateValue = NewDashboardUtil.getWeekDateRange();
            } else if ($scope.compareTypeData.compareType === COMPARE_TYPE['month']) {
                dateValue = NewDashboardUtil.getMonthDateRange();
            } else if ($scope.compareTypeData.compareType === COMPARE_TYPE['year']) {
                dateValue = NewDashboardUtil.getYearDateRange();
            }

            $scope.chartData.dateRange.startDate = dateValue[0];
            $scope.chartData.dateRange.endDate = dateValue[1];
        }

        /**
         *
         * @param localChangeDate  True if use date range piker of chart directive.False if use date from overview or comparision
         */
        function updateChart(localChangeDate) {
            // temp disable char when updating data
            $scope.showChart = false;

            // display chart again to fix zoom error
            setTimeout(function () {
                $scope.showChart = true;

                var data = $scope.chartData.reports;
                if (DASHBOARD_TYPE_JSON['DISPLAY'] === $scope.dashboardType.name) {
                    // sort by date field
                    data = sort(getDateKey(), data);

                    $scope.chartConfig = chartConfig(data, localChangeDate);
                } else if (DASHBOARD_TYPE_JSON['VIDEO'] === $scope.dashboardType.name) {
                    // sort by date field
                    data = sort(getDateKey(), data);

                    $scope.chartConfig = chartConfig(data, localChangeDate);
                } else if (DASHBOARD_TYPE_JSON['UNIFIED_REPORT'] === $scope.dashboardType.name) {
                    // no need sort, already sorted by date

                    $scope.chartConfig = chartConfig(data, localChangeDate);
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

        function _onDateRangeChange(newValue, oldValue, scope) {
            if (NewDashboardUtil.isDifferentDate(newValue, oldValue)) {
                onDateApply();
            }
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

        function isInDateRang(date, selectedDate) {
            if (!selectedDate) return true;
            var startDate = selectedDate.startDate;
            var endDate = selectedDate.endDate;

            if (startDate && endDate && date <= endDate && date >= startDate) return true;
            if (!startDate && endDate && date <= endDate) return true;
            if (startDate && !endDate && date >= startDate) return true;

            return false;
        }

        /**
         *
         * @param reportDetails list of reports to draw chart
         * @param localChangeDate True if use date range piker of chart directive.False if use date from overview or comparision
         * @returns {*}
         */
        function chartConfig(reportDetails, localChangeDate) {
            if (!reportDetails || reportDetails.length === 0) return null;
            var showFields = getShowFields($scope.dashboardType);
            var dates = [];
            var showData = {};
            var key = getDateKey();
            var dateFormat = getDateFormat();
            if (!localChangeDate) {
                $scope.selectedDate = NewDashboardUtil.getStringDate($scope.chartData.dateRange);
            }

            angular.forEach(reportDetails, function (report) {
                var dateValue = report[key];

                // normalize dateValue to standard format "Y-m-d" for comparison date range
                dateValue = normalizeDatevalue(dateValue, dateFormat);

                if (isInDateRang(dateValue, $scope.selectedDate)) {
                    dates.push(dateValue); // dates.push($filter('date')(dateValue));
                    angular.forEach(showFields, function (field) {
                        if (!showData[field])
                            showData[field] = [];
                        var digitOnly = NewDashboardUtil.removeNonDigit(report[field]);
                        digitOnly = digitOnly ? digitOnly : 0;
                        showData[field].push(Number(digitOnly));
                    });
                }
            });

            var chartSeries = [];
            var i = 0;
            angular.forEach(showFields, function (field) {
                var json = {
                    name: getLabelForChart(field, $scope.dashboardType),
                    data: showData[field],
                    connectNulls: true,
                    color: DASHBOARD_COLOR[i]
                };

                i++;
                chartSeries.push(json);
            });

            return {
                options: {
                    chart: {
                        type: 'line'
                    },
                    title: {
                        text: null
                    },
                    plotOptions: {
                        line: {
                            dataLabels: {
                                enabled: false
                            },
                            enableMouseTracking: true
                        }
                    }
                },
                xAxis: {
                    categories: dates,
                    labels: {
                        // autoRotation: [-10, -20, -30, -40, -50, -60, -70, -80, -90]
                        rotation: -60
                    }
                },
                yAxis: {
                    title: {
                        text: null
                    }
                },
                series: chartSeries
            };
        }

        function onDateApply() {
            $scope.selectedDate = NewDashboardUtil.getStringDate($scope.chartData.dateRange);
            updateChart(true);
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