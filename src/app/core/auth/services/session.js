angular.module('tagcade.core.auth')

    .factory('Session', function (USER_ROLES) {
        'use strict';

        function Session(token, id, username, userRoles, enabledModules) {
            this.token = token;
            this.id = parseInt(id, 10) || null;
            this.username = username;
            
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

        return {
            /**
             * @param {String|Object} token
             * @param {Number} id
             * @param {String} username
             * @param {Array} [userRoles]
             * @param {Array} [enabledModules]
             */
            createNew: function(token, id, username, userRoles, enabledModules) {
                return new Session(token, id, username, userRoles, enabledModules);
            },

            /**
             * @param {Object} data
             */
            createNewFrom: function (data) {
                return this.createNew(data.token, data.id, data.username, data.userRoles, data.enabledModules);
            },

            isSession: function(session) {
                return session instanceof Session;
            }
        };
    })

;