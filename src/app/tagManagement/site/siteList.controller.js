(function() {
    'use strict';

    angular.module('tagcade.tagManagement.site')
        .controller('SiteList', SiteList)
    ;

    function SiteList($scope, $rootScope, $modal, $translate, AlertService, SiteManager, SiteCache, sites, AtSortableService, historyStorage, HISTORY_TYPE_PATH, EVENT_SEARCH_AGAIN) {
        $scope.sites = sites;
        $scope.sitesAutoCreate = _filterSiteByAutoCreate(true);
        $scope.sitesManuallyCreate = _filterSiteByAutoCreate(false);
        $scope.typeList = 0;

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
        $scope.getAutoCreatedSite = getAutoCreatedSite;
        $scope.getSiteCreatedManually = getSiteCreatedManually;
        $scope.getSites = getSites;

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
                            $scope.sitesAutoCreate = _filterSiteByAutoCreate(true);
                            $scope.sitesManuallyCreate = _filterSiteByAutoCreate(false);

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

        function getSites() {
            $scope.typeList = 0;
            $scope.sites = sites;

            // this event to call filter again
            $rootScope.$broadcast(EVENT_SEARCH_AGAIN)
        }

        function getAutoCreatedSite() {
            $scope.typeList = 1;
        }

        function getSiteCreatedManually() {
            $scope.typeList = 2;
        }

        function showPagination(dataList) {
            return angular.isArray(dataList) && dataList.length > $scope.tableConfig.itemsPerPage;
        }

        function _filterSiteByAutoCreate(autoCreate) {
            var siteList = [];

            for(var idx in sites.plain()) {
                var site = sites[idx];
                if(site.autoCreate == autoCreate) {
                    siteList.push(site);
                }
            }

            return siteList;
        }

        $scope.$on('$locationChangeSuccess', function() {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.site)
        });
    }
})();