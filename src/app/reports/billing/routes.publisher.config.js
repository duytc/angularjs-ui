(function() {
    'use strict';

    angular.module('tagcade.reports.billing')
        .config(addStates)
    ;

    function addStates($stateProvider) {
        $stateProvider
            .state('app.publisher.reports.billing.account', {
                url: '/account?{product}{startDate:date}&{endDate:date}',
                params: {
                    startDate: null,
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    billing: {
                        controller: 'BillingReport',
                        templateUrl: function ($stateParams) {
                            if($stateParams.product == 'inBanner') {
                                return 'reports/billing/views/inBanner/account.tpl.html'
                            }

                            return 'reports/billing/views/reportType/account.tpl.html'
                        }
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, REPORT_TYPES, performanceReport, userSession) {
                        var params = $stateParams;

                        if($stateParams.product == 'inBanner') {
                            params.inBanner = true
                        }

                        return performanceReport.getAccountReport(params, {
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
            .state('app.publisher.reports.billing.sourceAccount', {
                url: '/sourceAccount?{product}{startDate:date}&{endDate:date}',
                params: {
                    startDate: null,
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    billing: {
                        controller: 'BillingReport',
                        templateUrl: 'reports/billing/views/source/account.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, REPORT_TYPES, sourceReport, userSession) {
                        var params = angular.extend($stateParams, {
                            reportType: REPORT_TYPES.account,
                            publisherId: userSession.id
                        });

                        return sourceReport.getAccountReport(params);
                    }
                },
                ncyBreadcrumb: {
                    label: 'Billing Reports'
                }
            })
        ;

        $stateProvider
            .state('app.publisher.reports.billing.hbAccount', {
                url: '/hbAccount?{product}{startDate:date}&{endDate:date}',
                params: {
                    startDate: null,
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    billing: {
                        controller: 'BillingReport',
                        templateUrl: 'reports/billing/views/headerBidding/account.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, REPORT_TYPES, HeaderBiddingReport, userSession) {
                        return HeaderBiddingReport.getAccountReport($stateParams, {
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
                url: '/sites?{product}{startDate:date}&{endDate:date}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    billing: {
                        controller: 'BillingReport',
                        templateUrl: function ($stateParams) {
                            if($stateParams.product == 'inBanner') {
                                return 'reports/billing/views/inBanner/site/sites.tpl.html'
                            }

                            return 'reports/billing/views/reportType/site/sites.tpl.html'
                        }
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, REPORT_TYPES, performanceReport, userSession) {
                        var params = $stateParams;

                        if($stateParams.product == 'inBanner') {
                            params.inBanner = true
                        }

                        return performanceReport.getPublisherSitesReport(params, {
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

        $stateProvider
            .state('app.publisher.reports.billing.hbSites', {
                url: '/hbSites?{product}{startDate:date}&{endDate:date}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    billing: {
                        controller: 'BillingReport',
                        templateUrl: 'reports/billing/views/headerBidding/site/sites.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, REPORT_TYPES, HeaderBiddingReport, userSession) {
                        return HeaderBiddingReport.getPublisherSitesReport($stateParams, {
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