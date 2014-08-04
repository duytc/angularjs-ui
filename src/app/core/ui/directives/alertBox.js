angular.module('tagcade.core.ui')

    .directive('alertBox', function($rootScope, AlertService) {
        'use strict';

        $rootScope.$on('$stateChangeSuccess', function() {
            AlertService.rotateAlerts();
        });

        return {
            restrict: 'AE',
            templateUrl: 'core/ui/directives/alertBox.tpl.html',
            scope: {
                hasAlerts: '=?'
            },
            controller: function ($scope) {
                $scope.alerts = [];
                $scope.hasAlerts = false;

                $scope.$watch(
                    function () {
                        return AlertService.getAlerts();
                    },
                    function (alerts) {
                        $scope.alerts = alerts;
                        $scope.hasAlerts = alerts.length > 0;
                    },
                    true
                );

                $scope.closeAlert = function (index) {
                    AlertService.removeAlert(index);
                };
            }
        };
    })

;