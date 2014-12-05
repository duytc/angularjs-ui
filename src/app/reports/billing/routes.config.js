(function() {
    'use strict';

    angular.module('tagcade.reports.billing')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        UserStateHelperProvider
            .state('reports.billing', {
                url: '/billing',
                views: {
                    'content@app': {
                        template: 'Billing reports coming soon.'
                    }
                },
                breadcrumb: {
                    title: 'Billing Reports'
                }
            })
        ;
    }
})();