angular.module('tagcade', [
    'ui.router',
    'templates-app',
    'templates-common',

    'tagcade.core',
    'tagcade.publisher',
    'tagcade.admin'
])

    .run(function ($rootScope, $location, $state, $q, Auth, HomeRedirector, ENTRY_STATE, AUTH_EVENTS) {
        $rootScope.$on('nav:reset', function() {
           console.log('nav:reset fired')
        });

        $rootScope.$on(AUTH_EVENTS.loginSuccess, function(event) {
            console.log('login success');
            HomeRedirector.redirect();
        });

        $rootScope.$on(AUTH_EVENTS.loginFailed, function(event) {
            console.log('login failed');
        });

        $rootScope.$on(AUTH_EVENTS.logoutSuccess, function(event) {
            console.log('logout success');
            $state.go(ENTRY_STATE);
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

            // my login state will early return here
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

                        // pending my patch to ui-router
                        //$state.go(toState.name, toParams, {resume: true});

                        $state.go(toState.name, toParams, {notify: false}).then(function() {
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