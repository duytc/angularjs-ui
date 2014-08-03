angular.module('tagcade.core.ui')

    .controller('AlertController', function($scope, AlertService) {
        'use strict';

        $scope.closeable = true;

        $scope.$watch(
            function() {
                return AlertService.getAlerts();
            },
            function(alerts) {
                $scope.alerts = alerts;
            },
            true
        );

        $scope.closeAlert = function(index) {
            AlertService.removeAlert(index);
        };
    })

;