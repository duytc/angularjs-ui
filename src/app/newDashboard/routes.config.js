(function () {
    'use strict';

    angular.module('tagcade.newDashboard')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        UserStateHelperProvider
            .state('newDashboard', {
                url: '/newDashboard',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'NewDashboard',
                        templateUrl: 'newDashboard/newDashboard.tpl.html'
                    }
                },
                resolve: {
                    publisher: function (accountManager, Auth) {
                        if (!Auth.isAdmin())
                            return accountManager.one('').get();
                    }
                },
                customResolve: {},
                ncyBreadcrumb: {
                    label: 'Dashboard'
                }
            })
        ;
    }
})();