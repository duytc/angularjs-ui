(function() {
    'use strict';

    angular.module('tagcade.reports.billing')
        .config(addStates)
    ;

    function addStates($stateProvider, UserStateHelperProvider) {
        UserStateHelperProvider
            .state('reports.billing', {
                url: '/billing',
                views: {
                    'content@app': {
                        templateUrl: 'reports/billing/billing.tpl.html'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Billing Reports'
                }
            })
        ;

        $stateProvider
            .state('app.publisher.reports.billing.accountReport', {
                url: '/account?{startDate:date}&{endDate:date}',
                params: {
                    startDate: null,
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'billing': {
                        controller: 'BillingReport',
                        templateUrl: 'reports/billing/accountReport.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, billingService, userSession) {
                        return billingService.getAccountReport($stateParams, { publisherId: userSession.id });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Billing Reports'
                }
            })
        ;

        $stateProvider
            .state('app.admin.reports.billing.accountReport', {
                url: '/accounts/{publisherId:int}?{startDate:date}&{endDate:date}',
                params: {
                    startDate: null,
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'billing': {
                        controller: 'BillingReport',
                        templateUrl: 'reports/billing/accountReport.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, billingService) {
                        return billingService.getAccountReport($stateParams);
                    }
                },
                ncyBreadcrumb: {
                    label: 'Billing Reports'
                }
            })
        ;
    }
})();