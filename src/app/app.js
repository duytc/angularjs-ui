angular.module('tagcadeApp', [
    'ui.router',

    'templates-app',
    'templates-common',

    'tagcadeApp.core',
    'tagcadeApp.user',
    'tagcadeApp.publisher',
    'tagcadeApp.admin'
])

    .run(function ($rootScope, $location, $state, $q, Auth, HomeRedirector, ENTRY_STATE, AUTH_EVENTS) {
        $rootScope.$on(AUTH_EVENTS.loginSuccess, function(event) {
            console.log('login success');
            HomeRedirector.redirect();
        });

        $rootScope.$on(AUTH_EVENTS.loginFailed, function(event) {
            console.log('login failed');
        });

        $rootScope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
            console.log('not authenticated');
            $state.go(ENTRY_STATE);
        });

        $rootScope.$on(AUTH_EVENTS.notAuthorized, function(event) {
            console.log('not authorized');
        });

        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
            console.log('state change start', toState.name);

            console.log(fromState);

            var stateData = toState.data || {};

            if (stateData.allowAnonymous) {
                return;
            }

            event.preventDefault();

            // checks the server if the user has a saved json web token
            // returns a promise, cached after first check
            Auth.check()
                .catch(function() {
                    $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
                    return $q.reject('not authenticated');
                })
                .then(
                    function() {
                        // user authenticated, check authorization

                        var requiredRole = stateData.role;

                        if (requiredRole && !Auth.isAuthorized(requiredRole)) {
                            $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
                            return $q.reject('not authorized');
                        }
                    }
                )
                .then(
                    function() {
                        // user authenticated and authorized, activate the state

                        $state.go(toState.name, toParams, {notify: false}).then(function() {
                            // https://github.com/angular-ui/ui-router/issues/178
                            // line 907 state.js
                            $rootScope.$broadcast('$stateChangeSuccess', toState, toParams, fromState, fromParams);
                        });
                    }
                )
            ;
        });

        $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            console.log('state change success', toState.name);
        });

        $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
            console.log('state change error', error);
        });
    })

;