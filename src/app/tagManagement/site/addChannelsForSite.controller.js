(function () {
    'use strict';

    angular
        .module('tagcade.tagManagement.site')
        .controller('AddChannelsForSite', AddChannelsForSite)
    ;

    function AddChannelsForSite($scope, _, $state, site, channels, channelsSite, $modalInstance, AlertService, SiteManager, historyStorage, HISTORY_TYPE_PATH) {
        $scope.site = site;
        $scope.channels = channels;

        $scope.channelsSite = [];
        angular.forEach(channelsSite, function(channel) {
            var index = _.findLastIndex(channels, {id: channel.id});
            if(index >= 0) {
                channels[index]['ticked'] = true;
                $scope.channelsSite.push(channels[index]);
            }
        });

        $scope.isFormValid = isFormValid;
        $scope.submit = submit;

        function isFormValid() {
            return $scope.addChannelsForSiteForm.$valid;
        }

        function submit() {
            $modalInstance.close();

            var channels = [];
            angular.forEach($scope.channelsSite, function(channel) {
                channels.push({channel: channel.id})
            });

            SiteManager.one($scope.site.id).patch({channelSites: channels})
                .then(function() {
                    historyStorage.getLocationPath(HISTORY_TYPE_PATH.site, $state.current);

                    AlertService.addFlash({
                        type: 'success',
                        message: 'The site has been updated'
                    });
                })
                .catch(function() {
                    AlertService.addAlert({
                        type: 'error',
                        message: 'The site could not be updated'
                    });
                });
        }
    }
})();