angular.module('tagcade.core.ui')

    .factory('AlertService', function () {
        var _alerts = [];

        return {
            getAlerts: function () {
                return _alerts;
            },

            addAlert: function (type, msg) {
                _alerts.push({
                    'type': type,
                    'msg': msg
                });
            },

            /**
             * Replace all current alerts with a new one
             *
             * @param type
             * @param message
             */
            replaceAlerts: function (type, message) {
                this.clearAll();
                this.addAlert(type, message);
            },

            removeAlert: function (index) {
                _alerts.splice(index, 1);
            },

            clearAll: function() {
                _alerts = [];
            }
        };
    })

;