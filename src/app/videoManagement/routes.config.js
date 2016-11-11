(function() {
    'use strict';

    angular.module('tagcade.videoManagement')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        UserStateHelperProvider
            .state('videoManagement', {
                abstract: true,
                url: '/videoManagement',
                ncyBreadcrumb: {
                    label: 'Video Management'
                }
            })
        ;
    }
})();