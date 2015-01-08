(function() {
    'use strict';

    angular.module('tagcade.supportTools.cpmEditor')
        .controller('CpmEditor', CpmEditor)
    ;

    function CpmEditor($scope, adTags, adNetworks, $modal, ngTableParams, $filter, TableParamsHelper, AdTagManager, AdNetworkManager) {
        var adTags =  adTags;
        var adNetworks =  adNetworks;

        $scope.openBoxCpmEditorForAdTag = openBoxCpmEditorForAdTag;
        $scope.openBoxCpmEditorForAdNetwork = openBoxCpmEditorForAdNetwork;

        $scope.tableParamsForAdTags = new ngTableParams(
            {
                page: 1,
                count: 10,
                sorting: {
                    name: 'asc'
                }
            },
            {
                total: adTags.length,
                getData: function($defer, params) {
                    var filters = TableParamsHelper.getFilters(params.filter());

                    var filteredData = params.filter() ? $filter('filter')(adTags, filters) : adTags;
                    var orderedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData;
                    var paginatedData = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());

                    params.total(orderedData.length);
                    $defer.resolve(paginatedData);
                }
            }
        );

        $scope.tableParamsForAdNetworks = new ngTableParams(
            {
                page: 1,
                count: 10,
                sorting: {
                    name: 'asc'
                }
            },
            {
                total: adNetworks.length,
                getData: function($defer, params) {
                    var filters = TableParamsHelper.getFilters(params.filter());

                    var filteredData = params.filter() ? $filter('filter')(adNetworks, filters) : adNetworks;
                    var orderedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData;
                    var paginatedData = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());

                    params.total(orderedData.length);
                    $defer.resolve(paginatedData);
                }
            }
        );

        function openBoxCpmEditorForAdTag(adTag) {
            $modal.open({
                templateUrl: 'supportTools/cpmEditor/formCpmEditorForAdTag.tpl.html',
                size : 'lg',
                controller: 'FormCpmEditor',
                resolve: {
                    data: function () {
                        return adTag;
                    },
                    tplConfirm: function () {
                        return 'supportTools/cpmEditor/confirmUpdateForAdTag.tpl.html';
                    },
                    Manager: function() {
                        return AdTagManager;
                    }
                }
            })
        }

        function openBoxCpmEditorForAdNetwork(adNetwork) {
            $modal.open({
                templateUrl: 'supportTools/cpmEditor/formCpmEditorForAdNetwork.tpl.html',
                size : 'lg',
                controller: 'FormCpmEditor',
                resolve: {
                    data: function () {
                        return adNetwork;
                    },
                    tplConfirm: function () {
                        return 'supportTools/cpmEditor/confirmUpdateForAdNetwork.tpl.html';
                    },
                    Manager: function() {
                        return AdNetworkManager;
                    }
                }
            })
        }

    }
})();