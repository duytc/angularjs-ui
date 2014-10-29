angular.module('tagcade.tagManagement.tagGenerator', [
    'ui.router'
])

    .config(function (UserStateHelperProvider) {
        'use strict';

        UserStateHelperProvider
            .state('tagManagement.tagGenerator', {
                url: '/generateTags?siteId',
                views: {
                    'content@app': {
                        controller: 'TagGeneratorController',
                        templateUrl: 'tagManagement/tagGenerator/views/tagGenerator.tpl.html'
                    }
                },
                resolve: {
                    siteList: /* @ngInject */ function (SiteManager) {
                        return SiteManager.getList();
                    },

                    site: /* @ngInject */ function ($stateParams, SiteManager) {
                        var siteId = $stateParams.siteId;

                        if (!siteId) {
                            return null;
                        }

                        return SiteManager.one(siteId).get();
                    },

                    jstags: /* @ngInject */ function (site) {
                        if (!site) {
                            return null;
                        }

                        return site.customGET('jstags');
                    }
                },
                customResolve: {
                    admin: {
                        publishers: /* @ngInject */ function(AdminUserManager) {
                            return AdminUserManager.getList({ filter: 'publisher' }).then(function (users) {
                                return users.plain();
                            });
                        }
                    }
                },
                breadcrumb: {
                    title: 'Generate Tags'
                },
                reloadOnSearch: false
            })
        ;
    })

;