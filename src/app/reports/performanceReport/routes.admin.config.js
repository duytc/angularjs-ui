(function() {
    'use strict';

    angular.module('tagcade.reports.performanceReport')
        .config(addStates)
    ;

    function addStates($stateProvider) {
        $stateProvider
            .state('app.admin.reports.performance.platform', {
                url: '/platform?{startDate:date}&{endDate:date}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: 'reports/performanceReport/views/reportType/platform.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, PerformanceReport) {
                        return PerformanceReport.getPlatformReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.platform
                        });
                    }
                }
            })
        ;

        $stateProvider
            .state('app.admin.reports.performance.platformAccounts', {
                url: '/platform/accounts?{startDate:date}&{endDate:date}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: 'reports/performanceReport/views/reportType/accounts.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, PerformanceReport) {
                        return PerformanceReport.getPlatformAccountsReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.platform
                        });
                    }
                }
            })
        ;

        $stateProvider
            .state('app.admin.reports.performance.platformSites', {
                url: '/platform/sites?{startDate:date}&{endDate:date}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: 'reports/performanceReport/views/reportType/site/sites.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, PerformanceReport) {
                        return PerformanceReport.getPlatformSitesReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.platform
                        });
                    }
                }
            })
        ;

        $stateProvider
            .state('app.admin.reports.performance.account', {
                url: '/accounts/{publisherId:int}?{startDate:date}&{endDate:date}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: 'reports/performanceReport/views/reportType/account.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, PerformanceReport) {
                        return PerformanceReport.getAccountReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.account
                        });
                    }
                }
            })
        ;

        $stateProvider
            .state('app.admin.reports.performance.adNetworks', {
                url: '/accounts/{publisherId:int}/adNetworks?{startDate:date}&{endDate:date}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: 'reports/performanceReport/views/reportType/adNetwork/adNetworks.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, PerformanceReport) {
                        return PerformanceReport.getPublisherAdNetworksReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.adNetwork
                        });
                    }
                }
            })
        ;

        $stateProvider
            .state('app.admin.reports.performance.sites', {
                url: '/accounts/{publisherId:int}/sites?{startDate:date}&{endDate:date}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: 'reports/performanceReport/views/reportType/site/sites.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, PerformanceReport) {
                        return PerformanceReport.getPublisherSitesReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.site
                        });
                    }
                }
            })
        ;
    }
})();