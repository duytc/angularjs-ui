angular.module('tagcade.reports.performanceReport')

    .controller('PerformanceReportController', function ($scope, $state, _, PERFORMANCE_REPORT_EVENTS, UserStateHelper, AlertService, ReportSelector) {
        'use strict';

        $scope.$on(
            PERFORMANCE_REPORT_EVENTS.formSubmit,
            /**
             *
             * @param {Object} event
             * @param {Object} criteria
             */
            function (event, criteria) {
                if (!criteria || !angular.isObject(criteria)) {
                    event.preventDefault();

                    AlertService.replaceAlerts({
                        type: 'error',
                        message: 'The requested report is missing parameters'
                    });

                    return;
                }

                var toState = $state.get('.reports.performanceReport.' + criteria.reportType, $state.get(UserStateHelper.getBaseState()));

                if (!toState) {
                    event.preventDefault();

                    AlertService.replaceAlerts({
                        type: 'error',
                        message: 'An error occurred trying to request the report'
                    });

                    return;
                }

                $state.transitionTo(toState, criteria);
        });

    })

;