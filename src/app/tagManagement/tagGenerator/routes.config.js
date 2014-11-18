(function() {
    'use strict';

    angular.module('tagcade.tagManagement.tagGenerator')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        UserStateHelperProvider
            .state('tagManagement.tagGenerator', {
                url: '/generateTags?siteId',
                views: {
                    'content@app': {
                        controller: 'TagGenerator',
                        templateUrl: 'tagManagement/tagGenerator/tagGenerator.tpl.html'
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
                        publishers: /* @ngInject */ function(adminUserManager) {
                            return adminUserManager.getList({ filter: 'publisher' }).then(function (users) {
                                return users.plain();
                            });
                        }
                    }
                },
                ncyBreadcrumb: {
                    label: 'Generate Tags'
                },
                reloadOnSearch: false
            })
        ;
    }
})();