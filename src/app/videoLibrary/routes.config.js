(function() {
    'use strict';

    angular.module('tagcade.videoLibrary')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        UserStateHelperProvider
            .state('videoLibrary', {
                abstract: true,
                url: '/videoLibrary',
                ncyBreadcrumb: {
                    label: 'Video Library'
                }
            })
        ;
    }
})();