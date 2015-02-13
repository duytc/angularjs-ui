(function() {
    'use strict';

    angular.module('tagcade.reports.billing')
        .config(addStates)
    ;

    function addStates($stateProvider) {
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
                        templateUrl: 'reports/billing/views/reportType/account.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, REPORT_TYPES, performanceReport, userSession) {
                        return performanceReport.getAccountReport($stateParams, {
                            reportType: REPORT_TYPES.account,
                            publisherId: userSession.id
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Billing Reports'
                }
            })
        ;

        $stateProvider
            .state('app.publisher.reports.billing.sites', {
                url: '/sites?{startDate:date}&{endDate:date}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    billing: {
                        controller: 'BillingReport',
                        templateUrl: 'reports/billing/views/reportType/site/sites.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, REPORT_TYPES, performanceReport, userSession) {
                        return performanceReport.getPublisherSitesReport($stateParams, {
                            reportType: REPORT_TYPES.site,
                            publisherId: userSession.id
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Billing reports'
                }
            })
        ;
    }
})();