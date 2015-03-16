(function() {
    'use strict';

    angular.module('tagcade.supportTools.sourceReportConfiguration')
        .config(addStates)
    ;

    function addStates($stateProvider) {
        $stateProvider
            .state('app.admin.supportTools.sourceReportConfiguration', {
                abstract: true,
                url: '/sourceReportConfiguration',
                ncyBreadcrumb: {
                    skip: true
                }
            });

        $stateProvider
            .state('app.admin.supportTools.sourceReportConfiguration.list', {
                url: '/list',
                views: {
                    'content@app': {
                        controller: 'EmailConfigsList',
                        templateUrl: 'supportTools/sourceReportConfiguration/views/emailConfigsList.tpl.html'
                    }
                },
                resolve: {
                    sourceReportList: /* @ngInject */ function(sourceReportConfig) {
                        return sourceReportConfig.getAllSourceConfig();
                    }
                },
                ncyBreadcrumb: {
                    label: 'Source Report Configuration'
                }
            })
        ;

        $stateProvider
            .state('app.admin.supportTools.sourceReportConfiguration.siteConfigByEmail', {
                url: '/listSiteConfig/email/{emailId}',
                views: {
                    'content@app': {
                        controller: 'SiteConfigByEmailList',
                        templateUrl: 'supportTools/sourceReportConfiguration/views/siteConfigByEmailList.tpl.html'
                    }
                },
                resolve: {
                    sourceReportHasConfig: /* @ngInject */ function(sourceReportConfig, $stateParams) {
                        return sourceReportConfig.getSourceReportHasConfig($stateParams.emailId);
                    }
                },
                ncyBreadcrumb: {
                    label: 'Site Config For Email - {{ sourceReportHasConfig.email }}'
                }
            })
        ;
    }
})();