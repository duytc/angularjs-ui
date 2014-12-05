(function () {
    'use strict';

    angular
        .module('tagcade.admin.dashboard')
        .controller('AdminDashboard', AdminDashboard)
    ;

    function AdminDashboard($scope, dashboard, $filter) {
        var rowCount = 10;

        $scope.dashboard = dashboard;

        $scope.chartConfigPlatform = chartBilledAmount();

        $scope.chartConfigOpportunities = chartOpportunities();

        $scope.topPublishers = $scope.dashboard.topPublishers;
        $scope.configPaginationTopPublishers = {
            itemsPerPage: rowCount,
            fillLastPage: true,
            itemsTotal : $scope.topPublishers.length
        };

        $scope.topSites = $scope.dashboard.topSites;
        $scope.configPaginationTopSites = {
            itemsPerPage: rowCount,
            fillLastPage: true,
            itemsTotal : $scope.topSites.length
        };

        function chartBilledAmount(){
            var reportDetails = (dashboard.platformStatistics.reports).reverse();

            var categoriesPlatform = [];
            var chartSeriesBilledAmount = [];
            for(var index in reportDetails)
            {
                categoriesPlatform[index] = $filter('date')(reportDetails[index].date);

                chartSeriesBilledAmount[index] = reportDetails[index].billedAmount;
            }

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
                plotOptions: {
                    line: {
                        dataLabels: {
                            enabled: true
                        },
                        enableMouseTracking: false
                    }
                },
                series: chartSeriesPlatform
            };

            return chartConfigPlatform;
        }
        //    end function

        function chartOpportunities(){
            var reportDetails = dashboard.platformStatistics.reports;

            var categoriesOpportunities = [];
            var chartSeriesSlotOpportunities = [];
            var chartSeriesTotalOpportunities = [];
            var chartSeriesTotalImpressions = [];
            for(var index in reportDetails)
            {
                categoriesOpportunities[index] = $filter('date')(reportDetails[index].date);

                chartSeriesSlotOpportunities[index] = reportDetails[index].slotOpportunities;

                chartSeriesTotalOpportunities[index] = reportDetails[index].totalOpportunities;

                chartSeriesTotalImpressions[index] = reportDetails[index].impressions;
            }

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
                    }
                },
                xAxis: {
                    categories: categoriesOpportunities
                },
                yAxis: {
                    title: {
                        text: 'Number'
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

            return chartConfigOpportunities;
        }
        //    end function
    }
})();