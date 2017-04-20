(function () {
    'use strict';

    angular.module('tagcade.blocks.alerts')
        .factory('AlertService', alertService)
    ;

    function alertService() {
        var _$alerts = [];
        var _$alertsNotRemove = [];
        var _$queuedAlerts = [];

        function addAlert(bucket, alert) {
            if (!angular.isArray(bucket)) {
                throw new Error('alert bucket is not an array');
            }

            alert = getValidAlert(alert);

            bucket.push(alert);
        }

        function getValidAlert(alert) {
            alert = alert || {};
            alert = angular.extend({
                type: 'info',
                title: null,
                message: null
            }, alert);

            if (alert.type === 'error') {
                alert.type = 'danger';
            }

            if (!angular.isString(alert.message) && !angular.isArray(alert.message)) {
                throw new Error('message body should be a string or an array of strings');
            }

            if (angular.isString(alert.message)) {
                var tmp = [];
                tmp.push(alert.message);

                alert.message = tmp;
            }

            return alert;
        }

        return {
            getAlerts: function () {
                return _$alertsNotRemove.concat(_$alerts);
            },

            /**
             * Show an alert immediately
             *
             * @param {object} message
             */
            addAlert: function (message) {
                addAlert(_$alerts, message);
            },

            addAlertNotRemove: function (message) {
                addAlert(_$alertsNotRemove, message);
            },

            /**
             * Queue an alert, until rotateAlerts is called
             * This could be done in a listener when the url changes
             *
             * @param {object} alert
             */
            addFlash: function (alert) {
                addAlert(_$queuedAlerts, alert);
            },

            rotateAlerts: function () {
                this.clearAll();

                angular.forEach(_$queuedAlerts, function (alert) {
                    _$alerts.push(alert);
                });

                _$queuedAlerts = [];
            },

            /**
             * Replace all current alerts with a new one
             *
             * @param {object} alert
             */
            replaceAlerts: function (alert) {
                // running this check first to ensure it's valid before we clear all current messages
                alert = getValidAlert(alert);

                this.clearAllRemovable();
                this.addAlert(alert);
            },

            removeAlert: function (index) {
                var totalAlertNotRemove = _$alertsNotRemove.length;

                if(index < totalAlertNotRemove) {
                    _$alertsNotRemove.splice(index, 1);
                } else {
                    _$alerts.splice(index - totalAlertNotRemove, 1);
                }
            },

            clearAllRemovable: function () {
                _$alerts = [];
            },

            clearAll: function () {
                _$alerts = [];
                _$alertsNotRemove = [];
            }
        }
    }
})();