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
                            if($stateParams.product == 'inBanner') {
                                return 'reports/billing/views/inBanner/platform.tpl.html'
                            }

                            return 'reports/billing/views/reportType/platform.tpl.html'
                        }
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, performanceReport, REPORT_TYPES) {
                        var params = $stateParams;

                        if($stateParams.product == 'inBanner') {
                            params.inBanner = true
                        }

                        return performanceReport.getPlatformReport(params, {
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
            .state('app.admin.reports.billing.hbPlatform', {
                url: '/hbPlatform?{product}{startDate:date}&{endDate:date}',
                params: {
                    startDate: null,
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    billing: {
                        controller: 'BillingReport',
                        templateUrl: 'reports/billing/views/headerBidding/platform.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, HeaderBiddingReport, REPORT_TYPES) {
                        return HeaderBiddingReport.getPlatformReport($stateParams, {
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
            .state('app.admin.reports.billing.sourcePlatform', {
                url: '/sourcePlatform?{product}{startDate:date}&{endDate:date}',
                params: {
                    startDate: null,
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    billing: {
                        controller: 'BillingReport',
                        templateUrl: 'reports/billing/views/source/platform.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, sourceReport, REPORT_TYPES) {
                        var params = angular.extend($stateParams, {
                            reportType: REPORT_TYPES.platform,
                            platformBreakdown: 'day'
                        });

                        return sourceReport.getPlatformReport(params);
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
                            if($stateParams.product == 'inBanner') {
                                return 'reports/billing/views/inBanner/accounts.tpl.html'
                            }

                            return 'reports/billing/views/reportType/accounts.tpl.html'
                        }
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, REPORT_TYPES, performanceReport) {
                        var params = $stateParams;

                        if($stateParams.product == 'inBanner') {
                            params.inBanner = true
                        }

                        return performanceReport.getPlatformAccountsReport(params, {
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
            .state('app.admin.reports.billing.hbPlatformAccounts', {
                url: '/hbPlatform/accounts?{product}{startDate:date}&{endDate:date}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    billing: {
                        controller: 'BillingReport',
                        templateUrl: 'reports/billing/views/headerBidding/accounts.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, REPORT_TYPES, HeaderBiddingReport) {
                        return HeaderBiddingReport.getPlatformAccountsReport($stateParams, {
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
            .state('app.admin.reports.billing.sourcePlatformAccounts', {
                url: '/sourcePlatform/accounts?{product}{startDate:date}&{endDate:date}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    billing: {
                        controller: 'BillingReport',
                        templateUrl: 'reports/billing/views/source/accounts.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, REPORT_TYPES, sourceReport) {
                        var params = angular.extend($stateParams, {
                            reportType: REPORT_TYPES.platform,
                            platformBreakdown: 'account'
                        });

                        return sourceReport.getPlatformAccountsReport(params);
                    }
                },
                ncyBreadcrumb: {
                    label: 'Billing Reports'
                }
            })
        ;

        $stateProvider
            .state('app.admin.reports.billing.hbAccount', {
                url: '/hbAccount/{publisherId:int}?{product}{startDate:date}&{endDate:date}',
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
                    reportGroup: /* @ngInject */ function ($stateParams, HeaderBiddingReport, REPORT_TYPES) {
                        return HeaderBiddingReport.getAccountReport($stateParams, {
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
                            if($stateParams.product == 'inBanner') {
                                return 'reports/billing/views/inBanner/site/sites.tpl.html'
                            }

                            return 'reports/billing/views/reportType/site/sites.tpl.html'
                        }
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, REPORT_TYPES, performanceReport) {
                        var params = $stateParams;

                        if($stateParams.product == 'inBanner') {
                            params.inBanner = true
                        }

                        return performanceReport.getPlatformSitesReport(params, {
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
                            if($stateParams.product == 'inBanner') {
                                return 'reports/billing/views/inBanner/account.tpl.html'
                            }

                            return 'reports/billing/views/reportType/account.tpl.html'
                        }
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, performanceReport, REPORT_TYPES) {
                        var params = $stateParams;

                        if($stateParams.product == 'inBanner') {
                            params.inBanner = true
                        }

                        return performanceReport.getAccountReport(params, {
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
            .state('app.admin.reports.billing.sourceAccount', {
                url: '/sourceAccount/{publisherId:int}?{product}{startDate:date}&{endDate:date}',
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
                    reportGroup: /* @ngInject */ function ($stateParams, sourceReport, REPORT_TYPES) {
                        var params = angular.extend($stateParams, {
                            reportType: REPORT_TYPES.account,
                            platformBreakdown: 'account'
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
                            if($stateParams.product == 'inBanner') {
                                return 'reports/billing/views/inBanner/site/sites.tpl.html'
                            }

                            return 'reports/billing/views/reportType/site/sites.tpl.html'
                        }
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, REPORT_TYPES, performanceReport) {
                        var params = $stateParams;

                        if($stateParams.product == 'inBanner') {
                            params.inBanner = true
                        }

                        return performanceReport.getPublisherSitesReport(params, {
                            reportType: REPORT_TYPES.site
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Billing reports'
                }
            })
        ;

        $stateProvider
            .state('app.admin.reports.billing.hbSites', {
                url: '/hbAccounts/{publisherId:int}/sites?{product}{startDate:date}&{endDate:date}',
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
                    reportGroup: /* @ngInject */ function ($stateParams, REPORT_TYPES, HeaderBiddingReport) {
                        return HeaderBiddingReport.getPublisherSitesReport($stateParams, {
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