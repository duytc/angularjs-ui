angular.module('tagcadeApp.user')

    .factory('Session', function () {
        function Session(token, username, roles) {
            this.token = token;
            this.username = username;

            if (!angular.isArray(roles)) {
                roles = [roles];
            }

            this.roles = roles;
            this.features = [];
        }

        Session.prototype.hasRole = function(role) {
            return this.roles.indexOf(role) !== -1;
        };

        Session.prototype.allowsFeature = function(feature) {
            if (this.hasRole('ROLE_ADMIN')) {
                return true;
            }

            return this.features.indexOf(feature) !== -1;
        };

        return {
            createNew: function(token, username, roles) {
                token = token || null;
                username = username || null;
                roles = roles || [];

                return new Session(token, username, roles)
            }
        };
    })

;