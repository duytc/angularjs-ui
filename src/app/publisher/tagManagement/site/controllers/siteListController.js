angular.module('tagcade.publisher.tagManagement.site')

    .controller('PublisherSiteListController', function ($scope, $filter, ngTableParams, sites) {
        'use strict';

        var data = sites;

        $scope.setWideContent();

        $scope.tableParams = new ngTableParams( // jshint ignore:line
            {
                page: 1,
                count: 25,
                sorting: {
                    id: 'asc'
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