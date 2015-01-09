(function() {
    'use strict';

    angular.module('tagcade.supportTools.cascadeManager')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        UserStateHelperProvider
            .state('supportTools.cascadeManager', {
                abstract: true,
                url: '/cascadeManager',
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state({
                name: 'supportTools.cascadeManager.edit',
                url: '/edit',
                views: {
                    'content@app': {
                        controller: 'CascadeManager',
                        templateUrl: 'supportTools/cascadeManager/cascadeManager.tpl.html'
                    }
                },
                resolve: {
                    adNetworks: function(AdNetworkManager) {
                        return AdNetworkManager.getList();
                    }
                },
                ncyBreadcrumb: {
                    label: 'Cascade Manager'
                }
            })
        ;
    }
})();