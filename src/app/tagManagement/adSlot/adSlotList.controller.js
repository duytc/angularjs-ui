(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adSlot')
        .controller('AdSlotList', AdSlotList)
    ;

    function AdSlotList($scope, $filter, $stateParams, $modal, $q, ngTableParams, AlertService, AdSlotManager, adSlots, site) {
        $scope.site = site;

        var data = adSlots;

        $scope.hasData = function () {
            return !!data.length;
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: 'There is currently no ad slots in this site'
            });
        }

        $scope.currentSiteId = $stateParams.siteId || null;

        $scope.tableParams = new ngTableParams( // jshint ignore:line
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
                    var filteredData = params.filter() ? $filter('filter')(data, params.filter()) : data;
                    var orderedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData;
                    var paginatedData = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());

                    params.total(orderedData.length);
                    $defer.resolve(paginatedData);
                }
            }
        );

        $scope.generateAdTag = function (adSlot) {
            var modalInstance = $modal.open({
                templateUrl: 'tagManagement/adSlot/generateAdTag.tpl.html',
                resolve: {
                    javascriptTag: function (AdSlotManager) {
                        return AdSlotManager.one(adSlot.id).customGET('jstag');
                    }
                },
                controller: function ($scope, javascriptTag) {
                    $scope.adSlotName = adSlot.name;
                    $scope.javascriptTag = angular.fromJson(javascriptTag);
                }
            });
        };

        $scope.confirmDeletion = function (adSlot, index) {
            var modalInstance = $modal.open({
                templateUrl: 'tagManagement/adSlot/confirmDeletion.tpl.html'
            });

            modalInstance.result.then(function () {
                return AdSlotManager.one(adSlot.id).remove()
                    .then(
                        function () {
                            var index = data.indexOf(adSlot);

                            if (index > -1) {
                                data.splice(index, 1);
                                $scope.tableParams.reload(); // refresh ng-table
                            }

                            AlertService.replaceAlerts({
                                type: 'success',
                                message: 'The ad slot was deleted'
                            });
                        },
                        function () {
                            AlertService.replaceAlerts({
                                type: 'danger',
                                message: 'The ad slot could not be deleted'
                            });
                        }
                    )
                ;
            });
        };
    }
})();