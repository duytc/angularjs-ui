(function() {
    'use strict';

    angular.module('tagcade.reports.performance')
        .config(addStates)
    ;

    function addStates($stateProvider) {
        $stateProvider
            .state('app.admin.reports.performance.platform', {
                url: '/platform?{startDate:date}&{endDate:date}',
                params: {
                    startDate: null,
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: 'reports/performance/views/reportType/platform.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, performanceReport) {
                        return performanceReport.getPlatformReport($stateParams, {
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
                        templateUrl: 'reports/performance/views/reportType/accounts.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, performanceReport) {
                        return performanceReport.getPlatformAccountsReport($stateParams, {
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
                        templateUrl: 'reports/performance/views/reportType/site/sites.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, performanceReport) {
                        return performanceReport.getPlatformSitesReport($stateParams, {
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
                        templateUrl: 'reports/performance/views/reportType/account.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, performanceReport) {
                        return performanceReport.getAccountReport($stateParams, {
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
                        templateUrl: 'reports/performance/views/reportType/adNetwork/adNetworks.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, performanceReport) {
                        return performanceReport.getPublisherAdNetworksReport($stateParams, {
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
                        templateUrl: 'reports/performance/views/reportType/site/sites.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, performanceReport) {
                        return performanceReport.getPublisherSitesReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.site
                        });
                    }
                }
            })
        ;
    }
})();