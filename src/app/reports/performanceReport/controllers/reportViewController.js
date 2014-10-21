angular.module('tagcade.reports.performanceReport')

    .controller('ReportViewController', function ($scope, $stateParams, $filter, ReportSelector, ngTableParams) {
        'use strict';

        $scope.reportParams = ReportSelector.getCriteriaSummary();

        var data = [
            {
                "date": "10\/21\/2014",
                "publisher": "ozusmedia",
                "totalOpportunities": 52145482,
                "slotOpportunities": 47008284,
                "impressions": 39335414,
                "passbacks": 7672870,
                "fillRate": 0.83677621586868
            },
            {
                "date": "10\/21\/2014",
                "publisher": "hutchmedia",
                "totalOpportunities": 54398334,
                "slotOpportunities": 31253980,
                "impressions": 30483259,
                "passbacks": 770721,
                "fillRate": 0.97534006868885
            },
            {
                "date": "10\/21\/2014",
                "publisher": "bluelinkpub",
                "totalOpportunities": 41357589,
                "slotOpportunities": 30693270,
                "impressions": 21456005,
                "passbacks": 9237265,
                "fillRate": 0.69904591462558
            },
            {
                "date": "10\/21\/2014",
                "publisher": "brightline",
                "totalOpportunities": 91037747,
                "slotOpportunities": 55889049,
                "impressions": 44890423,
                "passbacks": 10998626,
                "fillRate": 0.80320606278343
            },
            {
                "date": "10\/21\/2014",
                "publisher": "kinetomedia",
                "totalOpportunities": 65986233,
                "slotOpportunities": 48658622,
                "impressions": 45677698,
                "passbacks": 2980924,
                "fillRate": 0.93873801029548
            },
            {
                "date": "10\/21\/2014",
                "publisher": "standingovationmedia",
                "totalOpportunities": 57844868,
                "slotOpportunities": 57448086,
                "impressions": 57399056,
                "passbacks": 49030,
                "fillRate": 0.99914653379401
            },
            {
                "date": "10\/21\/2014",
                "publisher": "pgoamedia",
                "totalOpportunities": 63304363,
                "slotOpportunities": 49520762,
                "impressions": 47097538,
                "passbacks": 2423224,
                "fillRate": 0.95106650418667
            },
            {
                "date": "10\/21\/2014",
                "publisher": "gazermedia",
                "totalOpportunities": 20645588,
                "slotOpportunities": 13050826,
                "impressions": 8057697,
                "passbacks": 4993129,
                "fillRate": 0.61740896706461
            },
            {
                "date": "10\/21\/2014",
                "publisher": "nextpathmedia",
                "totalOpportunities": 31051651,
                "slotOpportunities": 30092540,
                "impressions": 15410802,
                "passbacks": 14681738,
                "fillRate": 0.51211369994025
            },
            {
                "date": "10\/21\/2014",
                "publisher": "agamedialab",
                "totalOpportunities": 36052449,
                "slotOpportunities": 34265784,
                "impressions": 28257892,
                "passbacks": 6007892,
                "fillRate": 0.82466789611468
            }
        ];

        $scope.tableParams = new ngTableParams( // jshint ignore:line
            {
                page: 1,
                count: 25,
                sorting: {
                    slotOpportunities: 'desc'
                }
            },
            {
                total: data.length,
                getData: function($defer, params) {
                    var filteredData = params.filter() ? $filter('filter')(data, params.filter()) : data;
                    var orderedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData;
                    var paginatedData = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());

                    params.total(orderedData.length);
                    $defer.resolve(paginatedData);
                }
            }
        );
    })

;