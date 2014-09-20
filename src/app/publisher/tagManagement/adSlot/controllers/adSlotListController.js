angular.module('tagcade.publisher.tagManagement.adSlot')

    .controller('PublisherAdSlotListController', function ($scope, $filter, $stateParams, $modal, ngTableParams, AlertService, AdSlotManager, adSlots) {
        'use strict';

        var data = adSlots;

        $scope.setWideContent();

        $scope.currentSiteId = $stateParams.siteId || null;

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

        $scope.generateAdTag = function (adSlot) {
            var modalInstance = $modal.open({
                templateUrl: 'publisher/tagManagement/adSlot/views/generateAdTag.tpl.html',
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
                templateUrl: 'publisher/tagManagement/adSlot/views/confirmDeletion.tpl.html'
            });

            modalInstance.result.then(function () {
                AdSlotManager.one(adSlot.id).remove()
                    .then(
                        function () {
                            data.splice(index, 1); // remove this ad slot from the data
                            $scope.tableParams.reload(); // refresh ng-table

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
    })

;