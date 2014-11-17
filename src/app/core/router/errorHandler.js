(function () {
    'use strict';

    angular.module('tagcade.core.router')
        .run(errorHandler)
    ;

    function errorHandler($rootScope, UserStateHelper) {
        $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
            console.log('$stateChangeError', error);

            // show generic error page unless we get more specific
            var errorCode = 500;

            if (404 === error.status) {
                errorCode = 404;
            }

            if (400 === error.status) {
                errorCode = 400;
            }

            UserStateHelper.transitionRelativeToBaseState('error.' + errorCode, {}, { location: 'replace' });
        });
    }
})();