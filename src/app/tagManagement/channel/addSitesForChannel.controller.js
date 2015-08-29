(function () {
    'use strict';

    angular
        .module('tagcade.tagManagement.channel')
        .controller('AddSitesForChannel', AddSitesForChannel)
    ;

    function AddSitesForChannel($scope, _, $state, sites, channel, sitesChannel, $modalInstance, AlertService, ChannelManager, historyStorage, HISTORY_TYPE_PATH) {
        $scope.channel = channel;
        $scope.sites = sites;

        $scope.sitesChannel = [];
        angular.forEach(sitesChannel, function(site) {
            var index = _.findLastIndex(sites, {id: site.id});
            if(index >= 0) {
                sites[index]['ticked'] = true;
                $scope.sitesChannel.push(sites[index]);
            }
        });

        $scope.isFormValid = isFormValid;
        $scope.submit = submit;

        function isFormValid() {
            return $scope.addSitesForChannelForm.$valid;
        }

        function submit() {
            $modalInstance.close();

            var sites = [];
            angular.forEach($scope.sitesChannel, function(site) {
                sites.push({site: site.id})
            });

            ChannelManager.one($scope.channel.id).patch({channelSites: sites})
                .then(function() {
                    historyStorage.getLocationPath(HISTORY_TYPE_PATH.channel, $state.current);

                    AlertService.addFlash({
                        type: 'success',
                        message: 'The channel has been updated'
                    });
                })
                .catch(function() {
                    AlertService.addAlert({
                        type: 'error',
                        message: 'The channel could not be updated'
                    });
                });
        }
    }
})();