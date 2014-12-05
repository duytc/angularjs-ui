(function() {
    'use strict';

    angular.module('tagcade.reports')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        UserStateHelperProvider
            .state('reports', {
                abstract: true,
                url: '/reports'
            })
        ;
    }
})();