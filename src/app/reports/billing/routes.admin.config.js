(function() {
    'use strict';

    angular.module('tagcade.reports.billing')
        .config(addStates)
    ;

    function addStates($stateProvider) {
        $stateProvider
            .state('app.admin.reports.billing.platform', {
                url: '/platform?{product}{startDate:date}&{endDate:date}',
                params: {
                    startDate: null,
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    billing: {
                        controller: 'BillingReport',
                        templateUrl: function ($stateParams) {
                            if($stateParams.product == 'headerBidding') {
                                return 'reports/billing/views/headerBidding/platform.tpl.html'
                            }

                            return 'reports/billing/views/reportType/platform.tpl.html'
                        }
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, performanceReport, REPORT_TYPES) {
                        return performanceReport.getPlatformReport($stateParams, {
                            reportType: REPORT_TYPES.platform,
                            platformBreakdown: 'day'
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Billing Reports'
                }
            })
        ;

        $stateProvider
            .state('app.admin.reports.billing.platformAccounts', {
                url: '/platform/accounts?{product}{startDate:date}&{endDate:date}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    billing: {
                        controller: 'BillingReport',
                        templateUrl: function ($stateParams) {
                            if($stateParams.product == 'headerBidding') {
                                return 'reports/billing/views/headerBidding/accounts.tpl.html'
                            }

                            return 'reports/billing/views/reportType/accounts.tpl.html'
                        }
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, REPORT_TYPES, performanceReport) {
                        return performanceReport.getPlatformAccountsReport($stateParams, {
                            reportType: REPORT_TYPES.platform,
                            platformBreakdown: 'account'
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Billing Reports'
                }
            })
        ;

        $stateProvider
            .state('app.admin.reports.billing.platformSites', {
                url: '/platform/sites?{product}{startDate:date}&{endDate:date}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    billing: {
                        controller: 'BillingReport',
                        templateUrl: function ($stateParams) {
                            if($stateParams.product == 'headerBidding') {
                                return 'reports/billing/views/headerBidding/site/sites.tpl.html'
                            }

                            return 'reports/billing/views/reportType/site/sites.tpl.html'
                        }
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, REPORT_TYPES, performanceReport) {
                        return performanceReport.getPlatformSitesReport($stateParams, {
                            reportType: REPORT_TYPES.platform,
                            platformBreakdown: 'site'
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Performance reports'
                }
            })
        ;

        $stateProvider
            .state('app.admin.reports.billing.account', {
                url: '/account/{publisherId:int}?{product}{startDate:date}&{endDate:date}',
                params: {
                    startDate: null,
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    billing: {
                        controller: 'BillingReport',
                        templateUrl: function ($stateParams) {
                            if($stateParams.product == 'headerBidding') {
                                return 'reports/billing/views/headerBidding/account.tpl.html'
                            }

                            return 'reports/billing/views/reportType/account.tpl.html'
                        }
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, performanceReport, REPORT_TYPES) {
                        return performanceReport.getAccountReport($stateParams, {
                            reportType: REPORT_TYPES.account
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Billing Reports'
                }
            })
        ;

        $stateProvider
            .state('app.admin.reports.billing.sites', {
                url: '/accounts/{publisherId:int}/sites?{product}{startDate:date}&{endDate:date}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    billing: {
                        controller: 'BillingReport',
                        templateUrl: function ($stateParams) {
                            if($stateParams.product == 'headerBidding') {
                                return 'reports/billing/views/headerBidding/site/sites.tpl.html'
                            }

                            return 'reports/billing/views/reportType/site/sites.tpl.html'
                        }
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, REPORT_TYPES, performanceReport) {
                        return performanceReport.getPublisherSitesReport($stateParams, {
                            reportType: REPORT_TYPES.site
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