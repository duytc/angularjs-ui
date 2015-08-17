(function () {
    'use strict';

    angular
        .module('tagcade.tagManagement.adNetwork')
        .controller('SitesForAdNetwork', SitesForAdNetwork)
    ;

    function SitesForAdNetwork($scope, $q, $modal, sites, adNetwork, AdNetworkManager, $modalInstance) {
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
                            if(newStatus) {
                                // update total ad tags active/pause for ad network
                                adNetwork.activeAdTagsCount += siteStatus.pausedAdTagsCount;
                                adNetwork.pausedAdTagsCount -= siteStatus.pausedAdTagsCount;

                                // update total ad tags active/pause for site
                                siteStatus.activeAdTagsCount += siteStatus.pausedAdTagsCount;
                                siteStatus.pausedAdTagsCount = 0;
                            } else {
                                // update total ad tags active/pause for ad network
                                adNetwork.activeAdTagsCount -= siteStatus.activeAdTagsCount;
                                adNetwork.pausedAdTagsCount += siteStatus.activeAdTagsCount;

                                // update total ad tags active/pause for site
                                siteStatus.pausedAdTagsCount += siteStatus.activeAdTagsCount;
                                siteStatus.activeAdTagsCount = 0;
                            }

                            return siteStatus.active = checked;
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