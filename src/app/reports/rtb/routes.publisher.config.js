(function() {
    'use strict';

    angular.module('tagcade.reports.rtb')
        .config(addStates)
    ;

    function addStates($stateProvider) {
        $stateProvider
            .state('app.publisher.reports.rtb.account', {
                url: '/account?{startDate:date}&{endDate:date}',
                params: {
                    startDate: null,
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
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, rtbReport, userSession) {
                        return rtbReport.getAccountReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.account,
                            publisherId: userSession.id
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'RTB reports'
                }
            })
        ;

        $stateProvider
            .state('app.publisher.reports.rtb.sites', {
                url: '/sites?{startDate:date}&{endDate:date}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: function($stateParams) {
                            if (!$stateParams.endDate) {
                                return 'reports/rtb/views/reportType/site/sites.tpl.html';
                            }

                            return 'reports/rtb/views/reportType/site/sitesDateRange.tpl.html';
                        }
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, rtbReport, userSession) {
                        return rtbReport.getPublisherSitesReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.site,
                            publisherId: userSession.id
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