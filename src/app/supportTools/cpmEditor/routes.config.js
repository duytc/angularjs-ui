(function() {
    'use strict';

    angular.module('tagcade.supportTools.cpmEditor')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        UserStateHelperProvider
            .state('supportTools.cpmEditor', {
                abstract: true,
                url: '/CpmEditor',
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('supportTools.cpmEditor.platform', {
            url: '/platform',
            views: {
                'content@app': {
                    controller: 'CpmEditor',
                    templateUrl: 'supportTools/cpmEditor/cpmEditor.tpl.html'
                }
            },
            resolve: {
                publishers: function(adminUserManager) {
                    return adminUserManager.getList();
                },
                adNetworks: function(AdNetworkManager) {
                    return AdNetworkManager.getList();
                }
            },
            ncyBreadcrumb: {
                label: 'AdTags'
            }
            })
            .state('supportTools.cpmEditor.account', {
                url: '/account',
                views: {
                    'content@app': {
                        controller: 'CpmEditor',
                        templateUrl: 'supportTools/cpmEditor/cpmEditor.tpl.html'
                    }
                },
                resolve: {
                    publishers: function() {
                        return null;
                    },
                    adNetworks: function(AdNetworkManager) {
                        return AdNetworkManager.getList();
                    }
                },
                ncyBreadcrumb: {
                    label: 'AdTags'
                }
            })
        ;
    }
})();