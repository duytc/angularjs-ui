angular.module('tagcade.core.auth')

    .constant('AUTH_TOKEN_NAME', 'tagcadeToken')

    .factory('Auth', function ($http, $q, $window, API_BASE_URL, AUTH_TOKEN_NAME, Session) {
        'use strict';

        var _session = null;
        var _persistToken = false;

        function _processTokenResponse(response) {
                if (!_verifyTokenResponse(response.data)) {
                    return $q.reject('missing data');
                }

                return response.data;
        }

        function _verifyTokenResponse(result) {
            return angular.isObject(result) &&
                result.hasOwnProperty('token') &&
                result.hasOwnProperty('username') &&
                result.hasOwnProperty('roles')
            ;
        }

        function _createSession(token, username, roles) {
            _session = Session.createNew(token, username, roles);
            return _session;
        }

        function _clearStorage() {
            $window.localStorage.clear();
        }

        /**
         *
         * @param {Object} credentials
         * @param {Boolean} rememberMe
         * @returns {promise}
         */
        function login(credentials, rememberMe) {
            return $http
                .post(API_BASE_URL + '/getToken', credentials)
                .then(_processTokenResponse)
                .then(function(data) {
                    var session = _createSession(
                        data.token,
                        data.username,
                        data.roles
                    );

                    _persistToken = !!rememberMe;

                    if (_persistToken) {
                        $window.localStorage[AUTH_TOKEN_NAME] = session.token;
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

            if (isAuthenticated()) {
                dfd.resolve(getSession());
                return dfd.promise;
            }

            var token = $window.localStorage[AUTH_TOKEN_NAME];

            if (!token) {
                dfd.reject('no token');
                return dfd.promise;
            }

            $http({
                method: 'POST',
                url: API_BASE_URL + '/checkToken',
                headers: {
                    Authorization: getAuthorizationHeaderValue(token)
                }
            })
                .then(
                    function(response) {
                        var userSession = _createSession(
                            token,
                            response.data.username,
                            response.data.roles
                        );

                        dfd.resolve(userSession);
                    },
                    function() {
                        _clearStorage();
                        dfd.reject('invalid stored token');
                    }
                )
            ;

            return dfd.promise;
        }

        function logout() {
            _session = null;
            _clearStorage();
        }

        function getSession() {
            if (isAuthenticated()) {
                return angular.copy(_session);
            }

            return null;
        }

        function isAuthenticated() {
            return !!_session && Session.isSession(_session);
        }

        function isAuthorized(role) {
            return isAuthenticated() && _session.hasRole(role);
        }

        function getAuthorizationHeaderValue(token) {
            if (angular.isString(token)) {
                return 'Bearer ' + token;
            }

            return null;
        }

        function isAdmin() {
            return isAuthorized('ROLE_ADMIN');
        }

        // public api
        return {
            login: login,
            logout: logout,
            check: check,
            getSession: getSession,
            isAuthenticated: isAuthenticated,
            isAuthorized: isAuthorized,
            getAuthorizationHeaderValue: getAuthorizationHeaderValue,
            isAdmin: isAdmin
        };
    })

;