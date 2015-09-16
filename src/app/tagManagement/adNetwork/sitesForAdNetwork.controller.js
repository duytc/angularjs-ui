(function () {
    'use strict';

    angular
        .module('tagcade.tagManagement.adNetwork')
        .controller('SitesForAdNetwork', SitesForAdNetwork)
    ;

    function SitesForAdNetwork($scope, $q, $modal, $state, sites, adNetwork, AdNetworkManager, AdNetworkCache, $modalInstance, historyStorage, HISTORY_TYPE_PATH) {
        $scope.sites = sites;
        $scope.adNetwork = adNetwork;

        $scope.configPagination = {
            itemsPerPage: 10,
            maxPages: 5
        };

        $scope.hasSites = hasSites;
        $scope.toggleStatus = toggleStatus;

        function hasSites() {
            return sites.length > 0;
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
                            $modalInstance.close();
                        })
                        .then(
                        function () {
                            AdNetworkManager.one(adNetwork.id).one('sites').getList()
                                .then(function(siteList) {
                                    $scope.sites = sites = siteList.plain();
                                });

                            AdNetworkCache.removeCacheAdNetwork();
                            historyStorage.getLocationPath(HISTORY_TYPE_PATH.adNetwork, $state.current);
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
    }
})();