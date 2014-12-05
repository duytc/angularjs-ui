(function () {
    'use strict';

    angular
        .module('tagcade.publisher.dashboard')
        .controller('PublisherDashboard', PublisherDashboard)
    ;

    function PublisherDashboard($scope, dashboard, $filter) {
        var rowCount = 10;

        $scope.dashboard = dashboard;

        $scope.chartConfigAccount = chartBilledAmount();

        $scope.chartConfigOpportunities = chartOpportunities();

        $scope.topSites = $scope.dashboard.topSites;
        $scope.configPaginationTopSites = {
            itemsPerPage: rowCount,
            fillLastPage: true,
            itemsTotal : $scope.topSites.length
        };

        $scope.topAdNetworks = $scope.dashboard.topAdNetworks;
        $scope.configPaginationTopAdnetworks = {
            itemsPerPage: rowCount,
            fillLastPage: true,
            itemsTotal : $scope.topAdNetworks.length
        };

        function chartBilledAmount(){
            var reportDetails = (dashboard.accountStatistics.reports).reverse();

            var categoriesAccount = [];
            var chartSeriesEstRevenue = [];
            for(var index in reportDetails)
            {
                categoriesAccount[index] = $filter('date')(reportDetails[index].date);

                chartSeriesEstRevenue[index] = reportDetails[index].estRevenue;
            }

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
        //    end function

        function chartOpportunities(){
            var reportDetails = dashboard.accountStatistics.reports;

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
        //    end function
    }
})();