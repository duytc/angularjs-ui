(function() {
    'use strict';

    angular.module('tagcade.reports.performanceReport')
        .config(addStates)
    ;

    function addStates($stateProvider) {
        $stateProvider
            .state('app.publisher.reports.performanceReport.account', {
                url: '/account?{startDate:date}&{endDate:date}',
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
                    reportGroup: /* @ngInject */ function ($stateParams, PerformanceReport, userSession) {
                        return PerformanceReport.getAccountReport($stateParams, { publisherId: userSession.id });
                    }
                }
            })
        ;

        $stateProvider
            .state('app.publisher.reports.performanceReport.adNetworks', {
                url: '/adNetworks?{startDate:date}&{endDate:date}',
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
                    reportGroup: /* @ngInject */ function ($stateParams, PerformanceReport, userSession) {
                        return PerformanceReport.getPublisherAdNetworksReport($stateParams, { publisherId: userSession.id });
                    }
                }
            })
        ;

        $stateProvider
            .state('app.publisher.reports.performanceReport.sites', {
                url: '/sites?{startDate:date}&{endDate:date}',
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
                    reportGroup: /* @ngInject */ function ($stateParams, PerformanceReport, userSession) {
                        return PerformanceReport.getPublisherSitesReport($stateParams, { publisherId: userSession.id });
                    }
                }
            })
        ;
    }
})();