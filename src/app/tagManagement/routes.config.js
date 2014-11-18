(function() {
    'use strict';

    angular.module('tagcade.tagManagement')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        UserStateHelperProvider
            .state('tagManagement', {
                abstract: true,
                url: '/tagManagement',
                ncyBreadcrumb: {
                    label: 'Tag Management'
                }
            })
        ;
    }
})();