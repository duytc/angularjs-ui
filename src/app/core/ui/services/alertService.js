angular.module('tagcade.core.ui')

    .factory('AlertService', function () {
        'use strict';

        var _alerts = [];
        var _queuedAlerts = [];

        function addAlert(bucket, alert) {
            if (!angular.isArray(bucket)) {
                throw new Error('alert bucket is not an array');
            }

            alert = getValidAlert(alert);
            bucket.push(alert);
        }

        function getValidAlert(alert) {
            alert = alert || {};
            angular.extend({
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
                return _alerts;
            },

            /**
             * Show an alert immediately
             *
             * @param {object} message
             */
            addAlert: function (message) {
                addAlert(_alerts, message);
            },

            /**
             * Queue an alert, until rotateAlerts is called
             * This could be done in a listener when the url changes
             *
             * @param {object} alert
             */
            addFlash: function (alert) {
                addAlert(_queuedAlerts, alert);
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
             * @param {object} alert
             */
            replaceAlerts: function (alert) {
                // running this check first to ensure it's valid before we clear all current messages
                alert = getValidAlert(alert);

                this.clearAll();
                this.addAlert(alert);
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