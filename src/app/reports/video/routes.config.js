(function() {
    'use strict';

    angular.module('tagcade.reports.video')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        UserStateHelperProvider
            .state('reports.video', {
                //abstract: true,
                url: '/video',
                views: {
                    'content@app': {
                        templateUrl: 'reports/video/views/video.tpl.html'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Video Reports'
                }
            })

            .state('reports.video.report', {
                url: '/report?{metrics}&{filters}&{breakdowns}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    video: {
                        controller: 'VideoReport',
                        templateUrl: 'reports/video/views/report.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, videoReportService) {
                        return videoReportService.getPulsePoint($stateParams);
                    }
                },
                ncyBreadcrumb: {
                    label: 'Video reports'
                }
            })
        ;
    }
})();