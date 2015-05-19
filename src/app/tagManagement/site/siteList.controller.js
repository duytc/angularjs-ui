(function() {
    'use strict';

    angular.module('tagcade.tagManagement.site')
        .controller('SiteList', SiteList)
    ;

    function SiteList($scope, $modal, AlertService, SiteManager, sites, statusManagementService) {
        $scope.sites = sites;

        statusManagementService.setCurrentPageForAdSlot(0);

        $scope.hasData = function () {
            return !!sites.length;
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: 'There is currently no sites'
            });
        }

        $scope.showPagination = showPagination;
        $scope.setCurrentPage = setCurrentPage;

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10,
            currentPage: statusManagementService.getCurrentConfigForSite().currentPage
        };

        $scope.confirmDeletion = function (site, index) {
            var modalInstance = $modal.open({
                templateUrl: 'tagManagement/site/confirmDeletion.tpl.html'
            });

            modalInstance.result.then(function () {
                return SiteManager.one(site.id).remove()
                    .then(
                        function () {
                            var index = sites.indexOf(site);

                            if (index > -1) {
                                sites.splice(index, 1);
                            }

                            statusManagementService.setCurrentPageForSite(0);

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

        function showPagination() {
            return angular.isArray($scope.sites) && $scope.sites.length > $scope.tableConfig.itemsPerPage;
        }

        function setCurrentPage(currentPage) {
            statusManagementService.setCurrentPageForSite(currentPage);
        }
    }
})();