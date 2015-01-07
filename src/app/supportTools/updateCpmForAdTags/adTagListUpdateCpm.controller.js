(function() {
    'use strict';

    angular.module('tagcade.supportTools.updateCpmForAdTags')
        .controller('AdTagListUpdateCpm', AdTagListUpdateCpm)
    ;

    function AdTagListUpdateCpm($scope, adTags, $modal, ngTableParams, $filter, TableParamsHelper, AlertService) {
        var data = adTags;

        $scope.openBoxUpdateCpm = openBoxUpdateCpm;

        $scope.hasAdTags = function () {
            return data.length > 0;
        };

        if (!$scope.hasAdTags()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: 'Does not have ad tag'
            });
        }

        $scope.tableParams = new ngTableParams(
            {
                page: 1,
                count: 10,
                sorting: {
                    name: 'asc'
                }
            },
            {
                total: data.length,
                getData: function($defer, params) {
                    var filters = TableParamsHelper.getFilters(params.filter());

                    var filteredData = params.filter() ? $filter('filter')(data, filters) : data;
                    var orderedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData;
                    var paginatedData = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());

                    params.total(orderedData.length);
                    $defer.resolve(paginatedData);
                }
            }
        );

        function openBoxUpdateCpm(adTag) {
            $modal.open({
                templateUrl: 'supportTools/updateCpmForAdTags/formUpdateCpmForAdTags.tpl.html',
                size : 'lg',
                controller: 'FormUpdateCpmForAdTags',
                resolve: {
                    adTag: function () {
                        return adTag;
                    }
                }
            })
        }
    }
})();