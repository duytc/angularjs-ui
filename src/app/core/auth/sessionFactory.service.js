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
             * @param {Boolean} demandSourceTransparency
             * @param {Boolean} enableViewTagcadeReport
             * @param {String} username
             * @param {Array} [userRoles]
             * @param {Array} [enabledModules]
             * @param {Array} [exchanges]
             * @param {Array} [tagDomain]
             * @param {string} [serveTime]
             */
            createNew: function(token, id, username, userRoles, enabledModules, exchanges, demandSourceTransparency, enableViewTagcadeReport, tagDomain,  serveTime) {
                return new Session(token, id, username, userRoles, enabledModules, exchanges, demandSourceTransparency, enableViewTagcadeReport, tagDomain, serveTime);
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

                return this.createNew(data.token, data.id, data.username, data.userRoles, data.enabledModules, data.exchanges, data.demandSourceTransparency, data.enableViewTagcadeReport, data.tagDomain, data.serveTime);
            },

            isSession: function(session) {
                return session instanceof Session;
            }
        };

        function Session(token, id, username, userRoles, enabledModules, exchanges, demandSourceTransparency, enableViewTagcadeReport, tagDomain, serveTime) {
            this.token = token;
            this.id = parseInt(id, 10) || null;
            this.username = username;
            this.exchanges = exchanges;
            this.tagDomain = tagDomain;
            this.serveTime = serveTime;

            // demandSourceTransparency is enabled if current user is not sub publisher
            this.demandSourceTransparency = userRoles.indexOf(USER_ROLES.subPublisher) > - 1 ? demandSourceTransparency : true;
            // enableViewTagcadeReport is enabled if current user is not sub publisher
            this.enableViewTagcadeReport = userRoles.indexOf(USER_ROLES.subPublisher) > - 1 ? enableViewTagcadeReport : true;

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