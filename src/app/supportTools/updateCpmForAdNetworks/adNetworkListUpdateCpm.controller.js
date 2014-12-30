(function() {
    'use strict';

    angular.module('tagcade.supportTools.updateCpmForAdNetworks')
        .controller('AdNetworkListUpdateCpm', AdNetworkListUpdateCpm)
    ;

    function AdNetworkListUpdateCpm($scope, adNetworks, $modal, ngTableParams, $filter, TableParamsHelper, AlertService) {
        var data = adNetworks;

        $scope.openBoxUpdateCpm = openBoxUpdateCpm;

        $scope.hasAdNetworks = function () {
            return data.length > 0;
        };

        if (!$scope.hasAdNetworks()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: 'Does not have ad network'
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

        function openBoxUpdateCpm(adNetwork) {
            $modal.open({
                templateUrl: 'supportTools/updateCpmForAdNetworks/formUpdateCpmForAdNetworks.tpl.html',
                size : 'lg',
                controller: 'FormUpdateCpmForAdNetwork',
                resolve: {
                    adNetwork: function () {
                        return adNetwork;
                    }
                }
            })
        }
    }
})();