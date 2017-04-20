(function () {
    'use strict';

    angular.module('tagcade.public')
        .config(function ($stateProvider) {
            $stateProvider
                .state('app.public', {
                    parent: 'public',
                    params: {
                        uniqueRequestCacheBuster: null
                    },
                    url: '/public/unifiedReport/report/detail?&reportView&token',
                    controller: 'shareableUnifiedReport',
                    templateUrl: 'public/shareableUnifiedReport.tpl.html',
                    resolve: {
                        reports: function ($stateParams, API_UNIFIED_PUBLIC_END_POINT, dataService) {
                            if (!!$stateParams.reportView) {
                                return dataService.makeHttpGetRequest('/v1/reportviews/:reportView/sharedReports', {
                                    token: $stateParams.token,
                                    reportView: $stateParams.reportView
                                }, API_UNIFIED_PUBLIC_END_POINT).catch(function() {
                                    return false
                                });
                            }

                            return null;
                        }
                    },
                    data: {
                        allowAnonymous: true
                    },
                    ncyBreadcrumb: {
                        label: '{{ reports.reportView.name }}'
                    }
                })
            ;
        })
    ;
})();