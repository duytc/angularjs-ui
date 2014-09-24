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
                result.hasOwnProperty('id') &&
                result.hasOwnProperty('username') &&
                result.hasOwnProperty('userRoles')
            ;
        }

        /**
         * @param {String|Object} token If this is an object, unpack variables and ignore the rest of the parameters
         * @param {Number} [id]
         * @param {String} [username]
         * @param {Array} [userRoles]
         * @param {Array} [enabledModules]
         */
        function _createSession(token, id, username, userRoles, enabledModules) {
            var s;

            if (angular.isObject(token)) {
                s = Session.createNewFrom(token);
            } else {
                s = Session.createNew(token, id, username, userRoles, enabledModules);
            }

            // this is a closure variable
            _session = s;

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

                    var session = _createSession(data);

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
                        var data = response.data;

                        // use existing token
                        data.token = token;

                        var userSession = _createSession(data);

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
            return isAuthenticated() && _session.hasUserRole(role);
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