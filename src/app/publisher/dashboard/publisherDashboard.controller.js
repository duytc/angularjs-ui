(function () {
    'use strict';

    angular
        .module('tagcade.publisher.dashboard')
        .controller('PublisherDashboard', PublisherDashboard)
    ;

    function PublisherDashboard($scope, dataDashboard, DateFormatter, $filter, $stateParams, UserStateHelper, AlertService, userSession) {
        $scope.dataDashboard = dataDashboard;
        var reportDetails = (dataDashboard.accountStatistics.reports).reverse();

        $scope.generateDashboard = generateDashboard;
        $scope.chartConfigRevenue = chartConfigRevenue(reportDetails);
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
        $scope.configTopSites = {
            itemsPerPage: rowCount,
            fillLastPage: 'no'
        };

        $scope.configTopAdNetworks = {
            itemsPerPage: rowCount,
            fillLastPage: 'no',
            noSlotOpp : true
        };

        function chartConfigRevenue(reportDetails){
            var categoriesAccount = [];
            var chartSeriesEstRevenue = [];

            angular.forEach(reportDetails, function(report) {
                chartSeriesEstRevenue.push(report.estRevenue);
                categoriesAccount.push($filter('date')(report.date));
            });

            var chartSeriesAccount = [
                {"name": "Estimated Revenue", "data": chartSeriesEstRevenue, connectNulls: true, color: {
                    linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
                    stops: [
                        [0, '#FF0000']
                    ]
                }}
            ];

            var chartConfigAccount = {
                options: {
                    chart: {
                        type: 'line'
                    },
                    title: {
                        text: null
                    }
                },
                xAxis: {
                    categories: categoriesAccount
                },
                yAxis: {
                    title: {
                        text: 'Dollar (USD)'
                    }
                },
                plotOptions: {
                    line: {
                        dataLabels: {
                            enabled: true
                        },
                        enableMouseTracking: false
                    }
                },
                series: chartSeriesAccount
            };

            return chartConfigAccount;
        }

        function chartConfigOpportunities(reportDetails){
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

            var chartSeriesOpportunities = [
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
                plotOptions: {
                    line: {
                        dataLabels: {
                            enabled: true
                        },
                        enableMouseTracking: false
                    }
                },
                series: chartSeriesOpportunities
            };

            return chartConfigOpportunities;
        }

        function generateDashboard(date) {
            var params = {
                startDate : DateFormatter.getFormattedDate(date.startDate),
                endDate : DateFormatter.getFormattedDate(date.endDate),
                id : userSession.id
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