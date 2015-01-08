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
            .state('supportTools.cpmEditor.list', {
            url: '/list',
            views: {
                'content@app': {
                    controller: 'CpmEditor',
                    templateUrl: 'supportTools/cpmEditor/cpmEditor.tpl.html'
                }
            },
            resolve: {
                adTags: function(AdTagManager) {
                    return AdTagManager.getList();
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