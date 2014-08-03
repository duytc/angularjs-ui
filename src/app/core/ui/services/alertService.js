angular.module('tagcade.core.ui')

    .factory('AlertService', function () {
        'use strict';

        var _alerts = [];
        var _queuedAlerts = [];

        function addAlert(bucket, type, msg) {
            type = type || 'info';

            if (!angular.isArray(bucket)) {
                throw new Error('alert bucket is not an array');
            }

            bucket.push({
                type: type,
                msg: msg
            });
        }

        return {
            getAlerts: function () {
                return _alerts;
            },

            /**
             * Show an alert immediately
             *
             * @param type
             * @param msg
             */
            addAlert: function (type, msg) {
                addAlert(_alerts, type, msg);
            },

            /**
             * Queue an alert, until rotateAlerts is called
             * This could be done in a listener when the url changes
             *
             * @param type
             * @param msg
             */
            addFlash: function (type, msg) {
                addAlert(_queuedAlerts, type, msg);
            },

            rotateAlerts: function () {
                this.clearAll();

                angular.forEach(_queuedAlerts, function (alert) {
                    _alerts.push(alert);
                });

                _queuedAlerts = [];
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