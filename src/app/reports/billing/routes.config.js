(function() {
    'use strict';

    angular.module('tagcade.reports.billing')
        .config(addStates)
    ;

    function addStates($stateProvider, UserStateHelperProvider) {
        UserStateHelperProvider
            .state('reports.billing', {
                abstract: true,
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
            .state('app.admin.reports.billing.platform', {
                url: '/platform?{startDate:date}&{endDate:date}',
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
                    reportGroup: /* @ngInject */ function ($stateParams, billingService, BILLING_REPORT_TYPES) {
                        return billingService.getPlatformReport($stateParams, {
                            reportType: BILLING_REPORT_TYPES.platform
                        });
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
                    reportGroup: /* @ngInject */ function ($stateParams, billingService, BILLING_REPORT_TYPES) {
                        return billingService.getAccountReport($stateParams, {
                            reportType: BILLING_REPORT_TYPES.account
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Billing Reports'
                }
            })
        ;

        UserStateHelperProvider
            .state('reports.billing.site', {
                url: '/sites/{siteId:int}?{startDate:date}&{endDate:date}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    billing: {
                        controller: 'BillingReport',
                        templateUrl: 'reports/billing/accountReport.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, BILLING_REPORT_TYPES, billingService) {
                        return billingService.getSiteReport($stateParams, {
                            reportType: BILLING_REPORT_TYPES.site
                        });
                    }
                }
            })
        ;

        $stateProvider
            .state('app.publisher.reports.billing.account', {
                url: '/account?{startDate:date}&{endDate:date}',
                params: {
                    startDate: null,
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    billing: {
                        controller: 'BillingReport',
                        templateUrl: 'reports/billing/accountReport.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, BILLING_REPORT_TYPES, billingService, userSession) {
                        return billingService.getAccountReport($stateParams, {
                            reportType: BILLING_REPORT_TYPES.account,
                            publisherId: userSession.id
                        });
                    }
                }
            })
        ;
    }
})();