(function () {
    'use strict';

    angular
        .module('tagcade.tagManagement.adNetwork')
        .controller('SitesForAdNetwork', SitesForAdNetwork)
    ;

    function SitesForAdNetwork($scope, $q, $stateParams, $modal, $state, $translate, sites, adNetwork, AdNetworkManager, AdNetworkCache, $modalInstance, historyStorage, HISTORY_TYPE_PATH) {
        $scope.sites = sites;
        $scope.adNetwork = adNetwork;

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10,
            totalItems: Number(sites.totalRecord)
        };
        $scope.availableOptions = {
            currentPage: $stateParams.page || 1,
            pageSize: 10
        };
        $scope.alert = {
            status: 'success',
            message: null
        };

        var params = {
            page: 1
        };

        $scope.hasSites = hasSites;
        $scope.toggleStatus = toggleStatus;
        $scope.showPagination = showPagination;
        $scope.changePage = changePage;
        $scope.removeAlert = removeAlert;
        
        function removeAlert() {
            $scope.alert = {
                status: 'success',
                message: null
            };
        }

        function hasSites() {
            return sites.records.length > 0;
        }

        function toggleStatus(siteStatus, newStatus) {
            var dfd = $q.defer();

            dfd.promise
                .then(function () {
                    var checked = newStatus ? 1 : 0;

                    if(adNetwork.id == null) {
                        throw new Error('Unknown Ad Network');
                    }

                    if(siteStatus.site.id == null) {
                        throw new Error('Unknown Site');
                    }

                    var request = AdNetworkManager.one(adNetwork.id).one('sites', siteStatus.site.id).customPUT('', 'status', { active: checked });
                    request
                        .catch(
                        function () {
                            // $modalInstance.close();

                            $scope.alert = {
                                status: 'danger',
                                message: $translate.instant('AD_NETWORK_MODULE.UPDATE_SITE_AD_NETWORK_FAIL')
                            };
                        })
                        .then(
                        function () {
                            // _getSite(params);
                            if(newStatus) {
                                siteStatus.activeAdTagsCount = siteStatus.pausedAdTagsCount;
                                siteStatus.pausedAdTagsCount = 0;
                            } else {
                                siteStatus.pausedAdTagsCount = siteStatus.activeAdTagsCount;
                                siteStatus.activeAdTagsCount = 0;
                            }

                            $scope.alert = {
                                status: 'success',
                                message: newStatus ? $translate.instant('AD_NETWORK_MODULE.ACTIVE_SITE_AD_NETWORK') : $translate.instant('AD_NETWORK_MODULE.PAUSE_SITE_AD_NETWORK')
                            };

                            //AdNetworkCache.removeCacheAdNetwork();
                            //historyStorage.getLocationPath(HISTORY_TYPE_PATH.adNetwork, $state.current);
                        });
                });

            if (!newStatus) {
                var confirmBox = $modal.open({
                    templateUrl: 'tagManagement/adNetwork/confirmPauseForSite.tpl.html'
                });

                confirmBox.result.then(function () {
                    dfd.resolve();
                });
            } else {
                // if it is not a pause, proceed without a modal
                dfd.resolve();
            }
        }

        function showPagination() {
            return angular.isArray($scope.sites.records) && $scope.sites.totalRecord > $scope.tableConfig.itemsPerPage;
        }

        function changePage(currentPage) {
            params = angular.extend(params, {page: currentPage});
            _getSite(params);
        }

        function _getSite(query) {
            return AdNetworkManager.one(adNetwork.id).one('sites').get(query)
                .then(function(sites) {
                    $scope.sites = sites;
                    $scope.tableConfig.totalItems = Number(sites.totalRecord);
                    $scope.availableOptions.currentPage = Number(query.page);
                });
        }
    }
})();