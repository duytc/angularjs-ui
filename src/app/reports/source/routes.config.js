(function() {
    'use strict';

    angular.module('tagcade.reports.source')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        UserStateHelperProvider
            .state('reports.source', {
                url: '/source',
                views: {
                    'content@app': {
                        templateUrl: 'reports/source/source.tpl.html'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Source Reports'
                }
            })
        ;
    }
})();