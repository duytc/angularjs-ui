angular.module('tagcade.core', [
    'ui.router',
    'restangular',

    'tagcade.core.ui',
    'tagcade.core.data',
    'tagcade.core.auth',
    'tagcade.core.myAccount'
])

    .constant('APP_NAME', 'Tagcade Platform')
    .constant('API_END_POINT', 'http://api.tagcade.dev/app_dev.php/api')
    .constant('API_BASE_URL', 'http://api.tagcade.dev/app_dev.php/api/v1')
    .constant('ENTRY_STATE', 'login')

    .constant('CORE_EVENTS', {
        resourceNotFound: 'core-resource-not-found'
    })

    // restangular setup
    .run(function ($rootScope, Restangular, API_BASE_URL, CORE_EVENTS, AUTH_EVENTS, Auth) {
        Restangular.setBaseUrl(API_BASE_URL);

        // for debugging
        //Restangular.setDefaultRequestParams('patch', {XDEBUG_SESSION_START: 1});
        //Restangular.setDefaultRequestParams('post', {XDEBUG_SESSION_START: 1});

        Restangular.addRequestInterceptor(function(element, operation, what, url) {
            if (['put', 'patch', 'post'].indexOf(operation) > -1) {
                // the id is specified in the url
                delete element['id'];
            }

            return element;
        });

        Restangular.addFullRequestInterceptor(function(element, operation, route, url, headers, params, httpConfig) {
            if (Auth.isAuthenticated()) {
                var currentSession = Auth.getSession();
                headers['Authorization'] = Auth.getAuthorizationHeaderValue(currentSession.token);
            }

            return {
                headers: headers
            };
        });

        Restangular.setErrorInterceptor(function(response, deferred, responseHandler) {
            if(response.status === 403) {
                $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
                return false;
            }

            if(response.status === 401) {
                $rootScope.$broadcast(AUTH_EVENTS.sessionTimeout);
                return false;
            }

            return true; // error not handled
        });
    })

    // authentication and authorization checks performed before every URL change
    .run(function ($rootScope, $location, $state, $q, UserStateHelper, Auth, ENTRY_STATE, AUTH_EVENTS) {
        if (!$location.path() || $location.path() == '/') {
            // if the user visits the root url directly
            Auth.check()
                .catch(
                    function () {
                        $state.go(ENTRY_STATE);
                        return $q.reject('not authenticated');
                    }
                )
                .then(
                    function () {
                        return UserStateHelper.transitionRelativeToBaseState('dashboard');
                    }
                )
        }

        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
            var stateData = toState.data || {};

            DEBUG && console.log(toState.name, toState.url);

            // my login state will early return here
            if (stateData.allowAnonymous) {
                return;
            }

            event.preventDefault();

            // checks the server if the user has a saved json web token
            // returns a promise, cached after first check
            Auth.check()
                .catch(
                    function() {
                        $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
                        return $q.reject('not authenticated');
                    }
                )
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
    })

    // event listeners
    .run(function ($rootScope, $state, Auth, UserStateHelper, AlertService, ENTRY_STATE, CORE_EVENTS, AUTH_EVENTS) {
        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
            // todo move this to a directive
            /*if (toState.name === 'homeRedirect') {
                // This state just redirects to another state, so we skip clearing messages here, it will be done on the final state
                return;
            }*/

            // Every time the URL changes, clear all messages
            AlertService.rotateAlerts();
        });

        $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
            DEBUG && console.log('$stateChangeError', arguments);

            // show generic error page unless we get more specific
            var errorCode = 500;

            if (404 === error.status) {
                errorCode = 404;
            }

            // todo what happens in this fails for some reason?
            UserStateHelper.transitionRelativeToBaseState('error.' + errorCode);
        });

        $rootScope.$on(AUTH_EVENTS.loginSuccess, function(event) {
            UserStateHelper.transitionRelativeToBaseState('dashboard');
        });

        $rootScope.$on(AUTH_EVENTS.loginFailed, function(event) {
            AlertService.replaceAlerts('danger', 'Login failed, did you provide an invalid username and/or password?');
        });

        $rootScope.$on(AUTH_EVENTS.logoutSuccess, function(event) {
            AlertService.addFlash('info', 'You are now logged out');
            $state.go(ENTRY_STATE);
        });

        $rootScope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
            $state.go(ENTRY_STATE);
        });

        $rootScope.$on(AUTH_EVENTS.sessionTimeout, function() {
            AlertService.addFlash('danger', 'You are not authenticated. This could mean your session expired, please log in again');
            $state.go(ENTRY_STATE);
        });

        $rootScope.$on(AUTH_EVENTS.notAuthorized, function(event) {
            UserStateHelper.transitionRelativeToBaseState('error.403');
        });
    })
;