(function() {
    'use strict';

    angular.module('tagcade.reports.billing')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        UserStateHelperProvider
            .state('reports.billing', {
                abstract: true,
                url: '/billing',
                views: {
                    'content@app': {
                        templateUrl: 'reports/billing/views/billing.tpl.html'
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
                        templateUrl: 'reports/billing/views/reportType/site/site.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, REPORT_TYPES, performanceReport) {
                        return performanceReport.getSiteReport($stateParams, {
                            reportType: REPORT_TYPES.site,
                            siteBreakdown: 'day'
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