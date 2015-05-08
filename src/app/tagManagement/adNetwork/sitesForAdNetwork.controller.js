(function () {
    'use strict';

    angular
        .module('tagcade.tagManagement.adNetwork')
        .controller('SitesForAdNetwork', SitesForAdNetwork)
    ;

    function SitesForAdNetwork($scope, $modal, sites, adNetwork, AdNetworkManager, $modalInstance) {
        $scope.sites = sites;
        $scope.adNetwork = adNetwork;

        $scope.configPagination = {
            itemsPerPage: 10,
            maxPages: 5
        };

        $scope.hasSites = hasSites;
        $scope.onClick = onClick;

        function hasSites() {
            return sites.length > 0;
        }

        function onClick(siteStatus) {
            var confirmBox = $modal.open({
                templateUrl: 'tagManagement/adNetwork/confirmPauseForSite.tpl.html',
                controller: 'ConfirmPauseForSite',
                resolve: {
                    active: function () {
                        return siteStatus.active;
                    }
                }
            });

            confirmBox.result.then(function () {
                var checked = siteStatus.active ? 0 : 1;

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
                        return siteStatus.active = checked;
                    });
            });
        }
    }
})();