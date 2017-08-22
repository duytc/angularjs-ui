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
                    url: '/public/unifiedReport/report/detail?reportView&token&page&limit&searchs',
                    controller: 'shareableUnifiedReport',
                    templateUrl: 'public/shareableUnifiedReport.tpl.html',
                    resolve: {
                        reports: function ($stateParams, API_UNIFIED_PUBLIC_END_POINT, dataService) {
                            if (!!$stateParams.reportView) {
                                var params = {
                                    token: $stateParams.token,
                                    reportView: $stateParams.reportView
                                };

                                // set default page
                                params.page = !$stateParams.page ? 1 : $stateParams.page;
                                params.limit = !$stateParams.limit ? 10 : $stateParams.limit;

                                return dataService.makeHttpGetRequest('/v1/reportviews/:reportView/sharedReports', params, API_UNIFIED_PUBLIC_END_POINT).catch(function(response) {
                                    return {
                                        status: response.status,
                                        message: response.data.message
                                    }
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