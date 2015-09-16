(function() {
    'use strict';

    angular.module('tagcade.tagManagement.site')
        .controller('SiteList', SiteList)
    ;

    function SiteList($scope, $modal, $translate, AlertService, SiteManager, SiteCache, sites, AtSortableService, historyStorage, HISTORY_TYPE_PATH) {
        $scope.sites = sites;

        $scope.hasData = function () {
            return !!sites.length;
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: $translate.instant('SITE_MODULE.CURRENTLY_NO_SITES')
            });
        }

        $scope.today = new Date();
        $scope.showPagination = showPagination;

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10
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

                            $scope.sites = sites;
                            SiteCache.deleteSite(site);

                            if($scope.tableConfig.currentPage > 0 && sites.length/10 == $scope.tableConfig.currentPage) {
                                AtSortableService.insertParamForUrl({page: $scope.tableConfig.currentPage});
                            }

                            AlertService.replaceAlerts({
                                type: 'success',
                                message: $translate.instant('SITE_MODULE.DELETE_SUCCESS')
                            });
                        },
                        function () {
                            AlertService.replaceAlerts({
                                type: 'danger',
                                message: $translate.instant('SITE_MODULE.DELETE_FAIL')
                            });
                        }
                    )
                ;
            });
        };

        function showPagination() {
            return angular.isArray($scope.sites) && $scope.sites.length > $scope.tableConfig.itemsPerPage;
        }

        $scope.$on('$locationChangeSuccess', function() {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.site)
        });
    }
})();