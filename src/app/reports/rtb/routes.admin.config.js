(function() {
    'use strict';

    angular.module('tagcade.reports.rtb')
        .config(addStates)
    ;

    function addStates($stateProvider) {
        $stateProvider
            .state('app.admin.reports.rtb.platform', {
                url: '/platform?{startDate:date}&{endDate:date}',
                params: {
                    startDate: null,
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: 'reports/rtb/views/reportType/platform.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, rtbReport) {
                        return rtbReport.getPlatformReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.platform,
                            platformBreakdown: 'day'
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'RTB reports'
                }
            })
        ;

        $stateProvider
            .state('app.admin.reports.rtb.platformAccounts', {
                url: '/platform/accounts?{startDate:date}&{endDate:date}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: 'reports/rtb/views/reportType/accounts.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, rtbReport) {
                        return rtbReport.getPlatformAccountsReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.platform,
                            platformBreakdown: 'account'
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'RTB reports'
                }
            })
        ;

        $stateProvider
            .state('app.admin.reports.rtb.platformSites', {
                url: '/platform/sites?{startDate:date}&{endDate:date}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: 'reports/rtb/views/reportType/site/sites.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, rtbReport) {
                        return rtbReport.getPlatformSitesReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.platform,
                            platformBreakdown: 'site'
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'RTB reports'
                }
            })
        ;

        $stateProvider
            .state('app.admin.reports.rtb.account', {
                url: '/accounts/{publisherId:int}?{startDate:date}&{endDate:date}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: 'reports/rtb/views/reportType/account.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, rtbReport) {
                        return rtbReport.getAccountReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.account
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'RTB reports'
                }
            })
        ;

        $stateProvider
            .state('app.admin.reports.rtb.sites', {
                url: '/accounts/{publisherId:int}/sites?{startDate:date}&{endDate:date}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: 'reports/rtb/views/reportType/site/sites.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, rtbReport) {
                        return rtbReport.getPublisherSitesReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.site
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'RTB reports'
                }
            })
        ;
    }
})();