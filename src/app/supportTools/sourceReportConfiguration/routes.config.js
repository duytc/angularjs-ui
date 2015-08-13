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
                url: '/list?publisherId',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'EmailConfigsList',
                        templateUrl: 'supportTools/sourceReportConfiguration/views/emailConfigsList.tpl.html'
                    }
                },
                resolve: {
                    publishers: /* @ngInject */ function(sourceReportConfig) {
                        return sourceReportConfig.getPublishers();
                    },

                    sourceReportList: /* @ngInject */ function(sourceReportConfig, $stateParams) {
                        var publisherId = $stateParams.publisherId;

                        if (!publisherId) {
                            return sourceReportConfig.getAllSourceConfig();
                        }

                        return sourceReportConfig.getSourceReportConfigsByPublisher(publisherId);
                    }
                },
                ncyBreadcrumb: {
                    label: 'Source Report Configuration'
                }
            })
        ;

        $stateProvider
            .state('app.admin.supportTools.sourceReportConfiguration.siteConfigByEmail', {
                url: '/listSiteConfig/email/{emailId}?publisherId',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'SiteConfigByEmailList',
                        templateUrl: 'supportTools/sourceReportConfiguration/views/siteConfigByEmailList.tpl.html'
                    }
                },
                resolve: {
                    sourceReportHasConfig: /* @ngInject */ function(sourceReportConfig, $stateParams) {
                        if($stateParams.publisherId) {
                            return sourceReportConfig.getSourceReportHasConfigByPublisher($stateParams.emailId, $stateParams.publisherId);
                        }

                        return sourceReportConfig.getSourceReportHasConfig($stateParams.emailId);
                    },

                    sourceReportConfigCurrent: /* @ngInject */ function(sourceReportConfig, $stateParams) {
                        return sourceReportConfig.getSourceReportConfigById($stateParams.emailId);
                    }
                },
                ncyBreadcrumb: {
                    label: 'Site Config For Email - {{ sourceReportConfigCurrent.email }}'
                }
            })
        ;
    }
})();