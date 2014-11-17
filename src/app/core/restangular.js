(function () {
    'use strict';

    angular.module('tagcade.core')
        .run(function ($rootScope, Restangular, API_BASE_URL, AUTH_EVENTS, Auth) {
            'use strict';

            Restangular.setBaseUrl(API_BASE_URL);

            // for debugging
            //Restangular.setDefaultRequestParams('patch', {XDEBUG_SESSION_START: 1});
            //Restangular.setDefaultRequestParams('post', {XDEBUG_SESSION_START: 1});

            Restangular.addRequestInterceptor(function(element, operation, what) {
                if (['put', 'patch', 'post'].indexOf(operation) === -1) {
                    // skip if operation does not match put, patch or post
                    return;
                }

                if (!angular.isObject(element)) {
                    return;
                }

                // the entity id is provided in the url
                delete element.id;

                if (!Auth.isAdmin() && ['sites', 'adnetworks'].indexOf(what) > -1) {
                    // the publisher field is determined server side based on the JWT
                    // trying to send it manually for non-admin users will result in an error
                    delete element.publisher;
                }

                angular.forEach(element, function (value, key) {
                    if (!angular.isObject(value)) {
                        return;
                    }

                    // if data being sent to the server is an object and has an id key
                    // replace the value with just the id
                    if (value.id) {
                        element[key] = value.id;
                    }
                });

                return element;
            });

            Restangular.addFullRequestInterceptor(function(element, operation, route, url, headers) {
                if (Auth.isAuthenticated()) {
                    var currentSession = Auth.getSession();
                    headers.Authorization = Auth.getAuthorizationHeaderValue(currentSession.token);
                }

                return {
                    headers: headers
                };
            });

            Restangular.setErrorInterceptor(function(response) {
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
    ;
})();