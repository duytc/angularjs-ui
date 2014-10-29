angular.module('tagcade.reports.performanceReport')

    .controller('PerformanceReportController', function ($scope, $state, _, PERFORMANCE_REPORT_EVENTS, UserStateHelper, AlertService) {
        'use strict';

        function openReport(event, reportTypeKey, params) {
            console.log('open report', reportTypeKey, params);

            var toState = $state.get('.reports.performanceReport.' + reportTypeKey, $state.get(UserStateHelper.getBaseState()));

            if (!toState) {
                event.preventDefault();

                AlertService.replaceAlerts({
                    type: 'error',
                    message: 'An error occurred trying to request the report'
                });

                return false;
            }

            $state.transitionTo(toState, params);
        }

        $scope.$on(PERFORMANCE_REPORT_EVENTS.formSubmit, openReport);
        $scope.$on(PERFORMANCE_REPORT_EVENTS.expandReport, openReport);

    })

;