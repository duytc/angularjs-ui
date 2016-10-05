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
                url: '/sites/{siteId:int}?{product}{startDate:date}&{endDate:date}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    billing: {
                        controller: 'BillingReport',
                        templateUrl: function ($stateParams) {
                            if($stateParams.product == 'headerBidding') {
                                return 'reports/billing/views/headerBidding/site/site.tpl.html'
                            }

                            return 'reports/billing/views/reportType/site/site.tpl.html'
                        }
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

        UserStateHelperProvider
            .state('reports.billing.video', {
                url: '/video?{product}{startDate:date}&{endDate:date}&{breakdown}&{reportTypeClone}&{publisherId}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    billing: {
                        controller: 'BillingReport',
                        templateUrl: function($stateParams) {
                            if($stateParams.breakdown != 'day') {
                                return 'reports/billing/views/video/reportAccount.tpl.html';
                            }

                            return 'reports/billing/views/video/report.tpl.html';
                        }
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, videoReportService, dateUtil) {
                        var params = {
                            breakdowns: angular.toJson([!$stateParams.breakdown ? 'day' : $stateParams.breakdown]),
                            metrics: angular.toJson([]),
                            filters: angular.toJson({
                                publisher: !!$stateParams.publisherId ? [$stateParams.publisherId] : [],
                                startDate: dateUtil.getFormattedDate($stateParams.startDate),
                                endDate: dateUtil.getFormattedDate($stateParams.endDate)
                            })
                        };

                        return videoReportService.getPulsePoint(params)
                    }
                },
                ncyBreadcrumb: {
                    label: 'Billing reports'
                }
            })
        ;
    }
})();