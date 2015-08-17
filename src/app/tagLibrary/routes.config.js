(function() {
    'use strict';

    angular.module('tagcade.tagLibrary')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        UserStateHelperProvider
            .state('tagLibrary', {
                abstract: true,
                url: '/library',
                ncyBreadcrumb: {
                    label: 'library'
                }
            })
        ;
    }
})();