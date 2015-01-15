(function() {
    'use strict';

    angular.module('tagcade.reports.source')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        UserStateHelperProvider
            .state('reports.source', {
                url: '/source',
                views: {
                    'content@app': {
                        templateUrl: 'reports/source/views/source.tpl.html'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Source Reports'
                }
            })
        ;

        UserStateHelperProvider
            .state('reports.source.siteDateRange', {
                url: '/site/{siteId:int}?{startDate:date}&{endDate:date}',
                params: {
                    endDate: null
                },
                views: {
                    'source': {
                        controller: 'SourceReportController',
                        templateUrl: 'reports/source/views/siteDateRange.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, sourceReport) {
                        return sourceReport.getSiteReport($stateParams);
                    }
                }
            })
        ;

        UserStateHelperProvider
            .state('reports.source.siteDetail', {
                url: '/site/{siteId:int}/detail?{date:date}',
                views: {
                    'source': {
                        controller: 'SourceReportDetailController',
                        templateUrl: 'reports/source/views/siteDetail.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, sourceReport) {
                        return sourceReport.getSiteReportDetail($stateParams);
                    }
                }
            })
        ;
    }
})();