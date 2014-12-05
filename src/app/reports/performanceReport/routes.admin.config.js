(function() {
    'use strict';

    angular.module('tagcade.reports.performanceReport')
        .config(addStates)
    ;

    function addStates($stateProvider) {
        $stateProvider
            .state('app.admin.reports.performanceReport.platform', {
                url: '/platform?{startDate:date}&{endDate:date}',
                params: {
                    endDate: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: 'reports/performanceReport/views/reportType/platform.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PerformanceReport) {
                        return PerformanceReport.getPlatformReport($stateParams);
                    }
                }
            })
        ;

        $stateProvider
            .state('app.admin.reports.performanceReport.platformAccounts', {
                url: '/platform/accounts?{startDate:date}&{endDate:date}',
                params: {
                    endDate: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: 'reports/performanceReport/views/reportType/accounts.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PerformanceReport) {
                        return PerformanceReport.getPlatformAccountsReport($stateParams);
                    }
                }
            })
        ;

        $stateProvider
            .state('app.admin.reports.performanceReport.platformSites', {
                url: '/platform/sites?{startDate:date}&{endDate:date}',
                params: {
                    endDate: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: 'reports/performanceReport/views/reportType/site/sites.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PerformanceReport) {
                        return PerformanceReport.getPlatformSitesReport($stateParams);
                    }
                }
            })
        ;

        $stateProvider
            .state('app.admin.reports.performanceReport.account', {
                url: '/accounts/{publisherId:int}?{startDate:date}&{endDate:date}',
                params: {
                    endDate: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: 'reports/performanceReport/views/reportType/account.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PerformanceReport) {
                        return PerformanceReport.getAccountReport($stateParams);
                    }
                }
            })
        ;

        $stateProvider
            .state('app.admin.reports.performanceReport.adNetworks', {
                url: '/accounts/{publisherId:int}/adNetworks?{startDate:date}&{endDate:date}',
                params: {
                    endDate: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: 'reports/performanceReport/views/reportType/adNetwork/adNetworks.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PerformanceReport) {
                        return PerformanceReport.getPublisherAdNetworksReport($stateParams);
                    }
                }
            })
        ;

        $stateProvider
            .state('app.admin.reports.performanceReport.sites', {
                url: '/accounts/{publisherId:int}/sites?{startDate:date}&{endDate:date}',
                params: {
                    endDate: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: 'reports/performanceReport/views/reportType/site/sites.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PerformanceReport) {
                        return PerformanceReport.getPublisherSitesReport($stateParams);
                    }
                }
            })
        ;
    }
})();