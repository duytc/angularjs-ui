(function() {
    'use strict';

    angular.module('tagcade.tagManagement.site')
        .controller('SiteList', SiteList)
    ;

    function SiteList($scope, $rootScope, $modal, $translate, AlertService, SiteManager, sites, historyStorage, HISTORY_TYPE_PATH, EVENT_SEARCH_AGAIN, RTB_STATUS_LABELS, EVENT_ACTION_SORTABLE) {
        $scope.sites = sites;
        var typeOption = $scope.typeOption = {
            allSite: 0,
            AutoSite: 1,
            manualSite: 2
        };
        var createType = {
            manual: 0,
            auto: 1
        };
        $scope.typeList = typeOption.allSite;
        var params = {
            page: 1
        };

        var getSite;

        $scope.hasData = function () {
            return !!sites.records.length;
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: $translate.instant('SITE_MODULE.CURRENTLY_NO_SITES')
            });
        }

        $scope.today = new Date();
        $scope.showPagination = showPagination;
        $scope.rtbStatusLabels = RTB_STATUS_LABELS;
        $scope.getAutoCreatedSite = getAutoCreatedSite;
        $scope.getSiteCreatedManually = getSiteCreatedManually;
        $scope.getSites = getSites;
        $scope.changePage = changePage;
        $scope.searchData = searchData;

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10,
            totalItems: Number(sites.totalRecord)
        };

        $scope.availableOptions = {
            currentPage: 1,
            pageSize: 10
        };

        $scope.selectData = {
            query: null
        };

        $scope.confirmDeletion = function (site) {
            var modalInstance = $modal.open({
                templateUrl: 'tagManagement/site/confirmDeletion.tpl.html'
            });

            modalInstance.result.then(function () {
                return SiteManager.one(site.id).remove()
                    .then(
                        function () {
                            _getSite(params);

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
            $scope.typeList = typeOption.allSite;
            $scope.sites = sites;

            // this event to call filter again
            $rootScope.$broadcast(EVENT_SEARCH_AGAIN);

            _getSite({page: 1});
        }

        function getAutoCreatedSite() {
            $scope.typeList = typeOption.AutoSite;

            _getSite({autoCreate: createType.auto, page: 1});
        }

        function getSiteCreatedManually() {
            $scope.typeList = typeOption.manualSite;

            _getSite({autoCreate: createType.manual, page: 1});
        }

        function showPagination() {
            return angular.isArray($scope.sites.records) && $scope.sites.totalRecord > $scope.tableConfig.itemsPerPage;
        }

        $scope.$on('$locationChangeSuccess', function() {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.site)
        });

        function searchData() {
            var query = {searchKey: $scope.selectData.query || null};
            params = angular.extend(params, query);
            _getSite(params);
        }

        $scope.$on(EVENT_ACTION_SORTABLE, function(event, query) {
            params = angular.extend(params, query);
            _getSite(params);
        });

        function changePage(currentPage) {
            params = angular.extend(params, {page: currentPage});
            _getSite(params);
        }

        function _getSite(query) {
            clearTimeout(getSite);

            getSite = setTimeout(function() {
                params = query;
                return SiteManager.one().get(query)
                    .then(function(sites) {
                        $scope.sites = sites;
                        $scope.tableConfig.totalItems = Number(sites.totalRecord);
                        $scope.availableOptions.currentPage = Number(query.page);
                    });
            }, 500);
        }
    }
})();