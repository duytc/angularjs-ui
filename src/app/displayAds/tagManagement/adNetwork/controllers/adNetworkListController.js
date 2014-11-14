angular.module('tagcade.displayAds.tagManagement.adNetwork')

    .controller('AdNetworkListController', function ($scope, $filter, $modal, $q, ngTableParams, TableParamsHelper, AlertService, AdNetworkManager, adNetworks) {
        'use strict';

        var data = adNetworks;

        $scope.hasData = function () {
            return !!data.length;
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: 'There is currently no ad networks'
            });
        }

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
                    var filters = TableParamsHelper.getFilters(params.filter());

                    var filteredData = params.filter() ? $filter('filter')(data, filters) : data;
                    var orderedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData;
                    var paginatedData = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());

                    params.total(orderedData.length);
                    $defer.resolve(paginatedData);
                }
            }
        );

        $scope.toggleAdNetworkStatus = function (adNetwork) {
            var newStatus = !adNetwork.active;

            var isPause = !newStatus;

            var dfd = $q.defer();

            dfd.promise.then(function () {
                AdNetworkManager.one(adNetwork.id).patch({
                    'active': newStatus
                })
                    .catch(function () {
                        AlertService.replaceAlerts({
                            type: 'error',
                            message: 'Could not change ad network status'
                        });

                        return $q.reject('could not update ad network status');
                    })
                    .then(function () {
                        adNetwork.active = newStatus;

                        var successMessage;

                        if (isPause) {
                            successMessage = 'The ad network has been paused. There may be a short delay before the associated ad tags are paused.';
                        } else {
                            successMessage = 'The ad network has been activated';
                        }

                        AlertService.replaceAlerts({
                            type: 'success',
                            message: successMessage
                        });
                    })
                ;
            });

            if (isPause) {
                var modalInstance = $modal.open({
                    templateUrl: 'displayAds/tagManagement/adNetwork/views/confirmPause.tpl.html'
                });

                modalInstance.result.then(function () {
                    dfd.resolve();
                });
            } else {
                // if it is not a pause, proceed without a modal
                dfd.resolve();
            }
        };
    })

;