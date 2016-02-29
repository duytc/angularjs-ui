(function () {
    'use strict';

    angular.module('tagcade.core.auth')
        .factory('sessionFactory', sessionFactory)
    ;

    function sessionFactory (USER_ROLES) {
        var api = {
            /**
             * @param {String|Object} token
             * @param {Number} id
             * @param {String} username
             * @param {Array} [userRoles]
             * @param {Array} [enabledModules]
             */
            createNew: function(token, id, username, userRoles, enabledModules, exchanges) {
                return new Session(token, id, username, userRoles, enabledModules, exchanges);
            },

            /**
             * @param {Object} data
             */
            createNewFrom: function (data) {
                if (!data.token) {
                    throw new Error('missing token');
                }

                if (!data.id) {
                    throw new Error('missing id');
                }

                if (!data.username) {
                    throw new Error('missing username');
                }

                return this.createNew(data.token, data.id, data.username, data.userRoles, data.enabledModules, data.exchanges);
            },

            isSession: function(session) {
                return session instanceof Session;
            }
        };

        function Session(token, id, username, userRoles, enabledModules, exchanges) {
            this.token = token;
            this.id = parseInt(id, 10) || null;
            this.username = username;
            this.exchanges = exchanges;

            if (!angular.isArray(userRoles)) {
                userRoles = [];
            }

            this.userRoles = userRoles;

            if (!angular.isArray(enabledModules)) {
                enabledModules = [];
            }

            this.enabledModules = enabledModules;
        }

        Session.prototype.hasUserRole = function(role) {
            return this.userRoles.indexOf(role) !== -1;
        };

        Session.prototype.isAdmin = function() {
            return this.userRoles.indexOf(USER_ROLES.admin) !== -1;
        };

        Session.prototype.hasModuleEnabled = function(module) {
            if (this.isAdmin()) {
                return true;
            }

            return this.enabledModules.indexOf(module) !== -1;
        };

        return api;
    }
})();