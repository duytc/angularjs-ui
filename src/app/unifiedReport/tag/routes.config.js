(function() {
    'use strict';

    angular.module('tagcade.unifiedReport.tag')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        // uniqueRequestCacheBuster is used as a work-around for reloading only the current state
        // currently UI-Router will reload all parent states as well, this causes problems having

        UserStateHelperProvider
            .state('unifiedReport.tag', {
                abstract: true,
                url: '/tag',
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('unifiedReport.tag.list', {
                url: '/list?page&sortField&orderBy&search',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'TagList',
                        templateUrl: 'unifiedReport/tag/tagList.tpl.html'
                    }
                },
                resolve: {
                    tags: /* @ngInject */ function(UnifiedReportTagManager, $stateParams) {
                        $stateParams.page = !$stateParams.page ? 1 : $stateParams.page;
                        $stateParams.orderBy = !$stateParams.orderBy ? 'desc' : $stateParams.orderBy;
                        $stateParams.sortField = !$stateParams.sortField ? 'id' : $stateParams.sortField;

                        return UnifiedReportTagManager.one().get($stateParams).then(function (tags) {
                            return tags.plain();
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'List User Tags'
                }
            })
            .state('unifiedReport.tag.new', {
                url: '/new',
                views: {
                    'content@app': {
                        controller: 'TagForm',
                        templateUrl: 'unifiedReport/tag/tagForm.tpl.html'
                    }
                },
                resolve: {
                    tag: function () {
                        return null
                    },
                    templates: /* @ngInject */ function(UnifiedReportTemplateManager) {
                        return UnifiedReportTemplateManager.getList().then(function (templates) {
                            return templates.plain();
                        });
                    },
                    integrations: /* @ngInject */ function(UnifiedReportIntegrationManager) {
                        return UnifiedReportIntegrationManager.getList().then(function (integrations) {
                            return integrations.plain();
                        });
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
                    label: 'New User Tag'
                }
            })
            .state('unifiedReport.tag.edit', {
                url: '/edit/{id:[0-9]+}',
                views: {
                    'content@app': {
                        controller: 'TagForm',
                        templateUrl: 'unifiedReport/tag/tagForm.tpl.html'
                    }
                },
                resolve: {
                    tag: function (UnifiedReportTagManager, $stateParams) {
                        return UnifiedReportTagManager.one($stateParams.id).get();
                    },
                    templates: /* @ngInject */ function(UnifiedReportTemplateManager) {
                        return UnifiedReportTemplateManager.getList().then(function (templates) {
                            return templates.plain();
                        });
                    },
                    integrations: /* @ngInject */ function(UnifiedReportIntegrationManager) {
                        return UnifiedReportIntegrationManager.getList().then(function (integrations) {
                            return integrations.plain();
                        });
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
                    label: 'Edit User Tag - {{ tag.name }}'
                }
            })
        ;
    }
})();