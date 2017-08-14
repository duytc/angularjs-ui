(function() {
    'use strict';

    angular.module('tagcade.unifiedReport.template')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        // uniqueRequestCacheBuster is used as a work-around for reloading only the current state
        // currently UI-Router will reload all parent states as well, this causes problems having

        UserStateHelperProvider
            .state('unifiedReport.template', {
                abstract: true,
                url: '/template',
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('unifiedReport.template.list', {
                url: '/list?page&sortField&orderBy&search',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'TemplateList',
                        templateUrl: 'unifiedReport/template/templateList.tpl.html'
                    }
                },
                resolve: {
                    templates: /* @ngInject */ function(UnifiedReportTemplateManager, $stateParams) {
                        $stateParams.page = !$stateParams.page ? 1 : $stateParams.page;
                        $stateParams.orderBy = !$stateParams.orderBy ? 'desc' : $stateParams.orderBy;
                        $stateParams.sortField = !$stateParams.sortField ? 'id' : $stateParams.sortField;

                        return UnifiedReportTemplateManager.one().get($stateParams).then(function (templates) {
                            return templates.plain();
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'List Template'
                }
            })
            .state('unifiedReport.template.new', {
                url: '/new',
                views: {
                    'content@app': {
                        controller: 'TemplateForm',
                        templateUrl: 'unifiedReport/template/templateForm.tpl.html'
                    }
                },
                resolve: {
                    reportViewList: function (UnifiedReportViewManager) {
                        return UnifiedReportViewManager.getList().then(function (reportViews) {
                            return reportViews.plain();
                        });
                    },
                    tags: function (UnifiedReportTagManager) {
                        return UnifiedReportTagManager.getList().then(function (tags) {
                            return tags.plain();
                        });
                    },
                    template: function() {
                        return null;
                    }
                },
                customResolve: {
                    admin: {
                        publishers: /* @ngInject */ function(adminUserManager) {
                            return adminUserManager.one('urEnabled').getList().then(function (users) {
                                return users.plain();
                            });
                        }
                    }
                },
                ncyBreadcrumb: {
                    label: 'New Template'
                }
            })
            .state('unifiedReport.template.edit', {
                url: '/edit/{id:[0-9]+}',
                views: {
                    'content@app': {
                        controller: 'TemplateForm',
                        templateUrl: 'unifiedReport/template/templateForm.tpl.html'
                    }
                },
                resolve: {
                    reportViewList: function (UnifiedReportViewManager) {
                        return UnifiedReportViewManager.getList().then(function (reportViews) {
                            return reportViews.plain();
                        });
                    },
                    tags: function (UnifiedReportTagManager) {
                        return UnifiedReportTagManager.getList().then(function (tags) {
                            return tags.plain();
                        });
                    },
                    template: /* @ngInject */ function($stateParams, UnifiedReportTemplateManager) {
                        return UnifiedReportTemplateManager.one($stateParams.id).get();
                    }
                },
                customResolve: {
                    admin: {
                        publishers: /* @ngInject */ function(adminUserManager) {
                            return adminUserManager.one('urEnabled').getList().then(function (users) {
                                return users.plain();
                            });
                        }
                    }
                },
                ncyBreadcrumb: {
                    label: 'Edit Template - {{ template.name }}'
                }
            })
        ;
    }
})();