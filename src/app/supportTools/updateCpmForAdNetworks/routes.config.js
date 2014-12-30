(function() {
    'use strict';

    angular.module('tagcade.supportTools.updateCpmForAdNetworks')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        UserStateHelperProvider
            .state('supportTools.updateCpmForAdNetworks', {
                abstract: true,
                url: '/CpmAdNetworks',
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('supportTools.updateCpmForAdNetworks.list', {
            url: '/list',
            views: {
                'content@app': {
                    controller: 'AdNetworkListUpdateCpm',
                    templateUrl: 'supportTools/updateCpmForAdNetworks/adNetworkListUpdateCpm.tpl.html'
                }
            },
            resolve: {
                adNetworks: function(AdNetworkManager) {
                    return AdNetworkManager.getList();
                }
            },
            ncyBreadcrumb: {
                label: 'AdNetworks'
            }
        })
        ;
    }
})();