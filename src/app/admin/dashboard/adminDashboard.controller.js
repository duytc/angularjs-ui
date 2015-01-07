(function () {
    'use strict';

    angular
        .module('tagcade.admin.dashboard')
        .controller('AdminDashboard', AdminDashboard)
    ;

    function AdminDashboard($scope, dataDashboard, DateFormatter, $filter, $stateParams, UserStateHelper, AlertService) {
        $scope.dataDashboard = dataDashboard;

        var reportDetails = dataDashboard.platformStatistics == null ? [] : (dataDashboard.platformStatistics.reports).reverse();

        $scope.generateDashboard = generateDashboard;
        $scope.chartConfigPlatform = chartConfigPlatform(reportDetails);
        $scope.chartConfigOpportunities = chartConfigOpportunities(reportDetails);

        $scope.date = {
            startDate :$stateParams.startDate,
            endDate : $stateParams.endDate
        };

        $scope.datePickerOpts = {
            maxDate:  moment().endOf('day'),
            ranges: {
                'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            }
        };

        var rowCount = 10;
        $scope.configPublishers = {
            itemsPerPage: rowCount,
            fillLastPage: 'no'
        };
        $scope.configTopSites = {
            itemsPerPage: rowCount,
            fillLastPage: 'no'
        };

        function chartConfigPlatform(reportDetails) {
            var chartSeriesBilledAmount = [];
            var categoriesPlatform = [];

            angular.forEach(reportDetails, function(report) {
                chartSeriesBilledAmount.push(report.billedAmount);
                categoriesPlatform.push($filter('date')(report.date));
            });

            var chartSeriesPlatform = [
                {"name": "Billed Amount", "data": chartSeriesBilledAmount, connectNulls: true, color: {
                    linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
                    stops: [
                        [0, '#FF0000']
                    ]
                }}
            ];

            var chartConfigPlatform = {
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
                    categories: categoriesPlatform
                },
                yAxis: {
                    title: {
                        text: 'Dollar (USD)'
                    }
                },
                series: chartSeriesPlatform
            };

            return chartConfigPlatform;
        }

        function chartConfigOpportunities(reportDetails) {
            var categoriesOpportunities = [];
            var chartSeriesSlotOpportunities = [];
            var chartSeriesTotalOpportunities = [];
            var chartSeriesTotalImpressions = [];

            angular.forEach(reportDetails, function(report) {
                categoriesOpportunities.push($filter('date')(report.date));
                chartSeriesSlotOpportunities.push(report.slotOpportunities);
                chartSeriesTotalOpportunities.push(report.totalOpportunities);
                chartSeriesTotalImpressions.push(report.impressions);
            });

            var chartSeriesAccount = [
                {"name": "Slot Opportunities", "data": chartSeriesSlotOpportunities, connectNulls: true, color: {
                    linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
                    stops: [
                        [0, '#0066FF']
                    ]
                }},
                {"name": "Total Opportunities", "data": chartSeriesTotalOpportunities, connectNulls: true, color: {
                    linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
                    stops: [
                        [0, '#66FF00']
                    ]
                }},
                {"name": "Impressions", "data": chartSeriesTotalImpressions, connectNulls: true, color: {
                    linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
                    stops: [
                        [0, '#990000']
                    ]
                }}
            ];

            var chartConfigOpportunities = {
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
                    categories: categoriesOpportunities
                },
                yAxis: {
                    title: {
                        text: null
                    }
                },
                series: chartSeriesAccount
            };

            return chartConfigOpportunities;
        }

        function generateDashboard(date) {
            var params = {
                startDate : DateFormatter.getFormattedDate(date.startDate),
                endDate : DateFormatter.getFormattedDate(date.endDate)
            };

            UserStateHelper.transitionRelativeToBaseState('dashboard', params)
                .catch(function(error) {
                    AlertService.replaceAlerts({
                        type: 'error',
                        message: 'An error occurred while trying to request dashboard'
                    });
                })
            ;
        }
    }
})();