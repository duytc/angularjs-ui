(function() {
    'use strict';

    angular.module('tagcade.unifiedReport')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        UserStateHelperProvider
            .state('unifiedReport', {
                abstract: true,
                url: '/unifiedReport',
                ncyBreadcrumb: {
                    label: 'Unified Report'
                }
            })
        ;
    }
})();