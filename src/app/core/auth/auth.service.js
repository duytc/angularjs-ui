(function () {
    'use strict';

    angular.module('tagcade.core.auth')
        .constant('authErrors', {
            noToken: 'no token',
            invalidToken: 'invalid token',
            invalidTokenResponse: 'invalid token response',
            missingRequiredUserRole: 'not authorized, missing user role',
            missingRequiredModule: 'not authorized, missing module'
        })
        .factory('Auth', auth)
    ;

    function auth($http, $q, API_BASE_URL, USER_ROLES, authErrors, sessionFactory, sessionStorage) {
        var api = {
            initSession: initSession,
            login: login,
            logout: logout,
            check: check,
            getSession: getSession,
            isAuthenticated: isAuthenticated,
            isAuthorized: isAuthorized,
            getAuthorizationHeaderValue: getAuthorizationHeaderValue,
            isAdmin: isAdmin,
            isSubPublisher: isSubPublisher
        };

        ////////////////////////

        var _$currentSession = null;
        var _$persistToken = false;

        function _processTokenResponse(response) {
            if (!_verifyTokenResponse(response.data)) {
                return $q.reject(new Error(authErrors.invalidTokenResponse));
            }

            return response.data;
        }

        function _verifyTokenResponse(result) {
            return angular.isObject(result) &&
                result.hasOwnProperty('token') &&
                result.hasOwnProperty('id') &&
                result.hasOwnProperty('username') &&
                result.hasOwnProperty('userRoles')
                ;
        }

        /**
         * @param {Object} data
         */
        function _createSession(data) {
            if (!angular.isObject(data)) {
                throw new Error('cannot create a session, expecting an object');
            }

            var session = sessionFactory.createNewFrom(data);

            _setSession(session);

            return session;
        }

        function _setSession(session) {
            if (!sessionFactory.isSession(session)) {
                throw new Error('that is a not a valid session object');
            }

            // this is a closure variable
            _$currentSession = session;
        }

        /**
         *
         * @param {Object} data
         * @returns {Object|Boolean}
         */
        function initSession(data) {
            try {
                return _createSession(data);
            } catch (e) {
                return false;
            }
        }

        /**
         *
         * @param {Object} credentials
         * @param {Boolean} rememberMe
         * @returns {promise}
         */
        function login(credentials, rememberMe) {
            return $http
                .post(API_BASE_URL + '/getToken', credentials, {
                    ignoreLoadingBar: true
                })
                .then(_processTokenResponse)
                .then(function(data) {

                    var session = _createSession(data);

                    _$persistToken = !!rememberMe;

                    if (_$persistToken) {
                        sessionStorage.setCurrentToken(session.token);
                        sessionStorage.setCurrentSettings(data.settings);
                    }

                    return session;
                })
                ;
        }

        /**
         * Checks if the saved token is valid
         *
         * @returns {promise}
         */
        function check() {
            var dfd = $q.defer();

            var token =  sessionStorage.getCurrentToken();

            if (!token) {
                dfd.reject(new Error(authErrors.noToken));
                return dfd.promise;
            }

            $http({
                method: 'POST',
                url: API_BASE_URL + '/checkToken',
                headers: {
                    Authorization: getAuthorizationHeaderValue(token)
                },
                ignoreLoadingBar: true
            })
                .then(
                function(response) {
                    var data = response.data;

                    // use existing token
                    data.token = token;

                    dfd.resolve(data);
                },
                function() {
                    sessionStorage.clearStorage();
                    dfd.reject(new Error(authErrors.invalidToken));
                }
            )
            ;

            return dfd.promise;
        }

        function logout() {
            _$currentSession = null;
            sessionStorage.clearStorage();
        }

        function getSession() {
            if (isAuthenticated()) {
                return angular.copy(_$currentSession);
            }

            return false;
        }

        function isAuthenticated() {
            return !!_$currentSession && sessionFactory.isSession(_$currentSession);
        }

        function isAuthorized(role) {
            return isAuthenticated() && _$currentSession.hasUserRole(role);
        }

        function getAuthorizationHeaderValue(token) {
            if (angular.isString(token)) {
                return 'Bearer ' + token;
            }

            return null;
        }

        function isAdmin() {
            // If the admin is currently logged in as a publisher
            // they will have a previous token set
            return isAuthorized(USER_ROLES.admin) && !sessionStorage.getPreviousToken();
        }

        function isSubPublisher() {
            return isAuthorized(USER_ROLES.subPublisher);
            //return isAuthorized(USER_ROLES.subPublisher) && !sessionStorage.getPreviousToken();
        }

        return api;
    }
})();