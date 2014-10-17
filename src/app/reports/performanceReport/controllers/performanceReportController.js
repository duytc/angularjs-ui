angular.module('tagcade.reports.performanceReport')

    .controller('PerformanceReportController', function ($rootScope, $scope, PERFORMANCE_REPORT_EVENTS) {
        'use strict';

        $scope.isAdmin = $scope.currentUser.isAdmin();

        $scope.reportSelectorCriteria = {};

        $scope.$on(PERFORMANCE_REPORT_EVENTS.formSubmit, function (event, criteria) {
            console.log(criteria, criteria === $scope.reportSelectorCriteria);

            //event.preventDefault();
        });

//        var toState = $state.get('.reports.performanceReport.' + $scope.criteria.reportType, $state.get(UserStateHelper.getBaseState()));
//
//                    if (!toState) {
//                        AlertService.replaceAlerts({
//                            type: 'error',
//                            message: 'The report could not be loaded'
//                        });
//
//                        return;
//                    }

        //                    $state.transitionTo(toState, {
//                        from: $scope.criteria.date.startDate.format('YYYY-MM-DD'),
//                        to: $scope.criteria.date.endDate.format('YYYY-MM-DD')
//                    });

    })

;