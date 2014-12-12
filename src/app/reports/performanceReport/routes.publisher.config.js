(function() {
    'use strict';

    angular.module('tagcade.reports.performanceReport')
        .config(addStates)
    ;

    function addStates($stateProvider) {
        $stateProvider
            .state('app.publisher.reports.performance.account', {
                url: '/account?{startDate:date}&{endDate:date}',
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
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, PerformanceReport, userSession) {
                        return PerformanceReport.getAccountReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.account,
                            publisherId: userSession.id
                        });
                    }
                }
            })
        ;

        $stateProvider
            .state('app.publisher.reports.performance.adNetworks', {
                url: '/adNetworks?{startDate:date}&{endDate:date}',
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
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, PerformanceReport, userSession) {
                        return PerformanceReport.getPublisherAdNetworksReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.adNetwork,
                            publisherId: userSession.id
                        });
                    }
                }
            })
        ;

        $stateProvider
            .state('app.publisher.reports.performance.sites', {
                url: '/sites?{startDate:date}&{endDate:date}',
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
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, PerformanceReport, userSession) {
                        return PerformanceReport.getPublisherSitesReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.site,
                            publisherId: userSession.id
                        });
                    }
                }
            })
        ;
    }
})();