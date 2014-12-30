(function() {
    'use strict';

    angular.module('tagcade.supportTools')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        UserStateHelperProvider
            .state('supportTools', {
                abstract: true,
                url: '/supportTools',
                ncyBreadcrumb: {
                    label: 'Support Tools'
                }
            })
        ;
    }
})();