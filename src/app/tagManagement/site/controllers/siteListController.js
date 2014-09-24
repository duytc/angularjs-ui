angular.module('tagcade.tagManagement.site')

    .controller('SiteListController', function ($scope, $filter, $modal, AlertService, SiteManager, ngTableParams, TableParamsHelper, sites) {
        'use strict';

        var data = sites;

        $scope.setWideContent();

        $scope.tableParams = new ngTableParams( // jshint ignore:line
            {
                page: 1,
                count: 10,
                sorting: {
                    id: 'asc'
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

        $scope.confirmDeletion = function (site, index) {
            var modalInstance = $modal.open({
                templateUrl: 'tagManagement/site/views/confirmDeletion.tpl.html'
            });

            modalInstance.result.then(function () {
                SiteManager.one(site.id).remove()
                    .then(
                        function () {
                            var index = data.indexOf(site);

                            if (index > -1) {
                                data.splice(index, 1);
                                $scope.tableParams.reload(); // refresh ng-table
                            }

                            AlertService.replaceAlerts({
                                type: 'success',
                                message: 'The site was deleted'
                            });
                        },
                        function () {
                            AlertService.replaceAlerts({
                                type: 'danger',
                                message: 'The site could not be deleted'
                            });
                        }
                    )
                ;
            });
        };
    })

;