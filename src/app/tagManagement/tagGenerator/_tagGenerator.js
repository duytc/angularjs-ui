angular.module('tagcade.tagManagement.tagGenerator', [
    'ui.router'
])

    .config(function (userStateHelperProvider) {
        'use strict';

        userStateHelperProvider
            .state('tagManagement.tagGenerator', {
                url: '/generateTags?siteId',
                params: {
                    siteId: null
                },
                views: {
                    'content@app': {
                        controller: 'TagGeneratorController',
                        templateUrl: 'tagManagement/tagGenerator/views/tagGenerator.tpl.html'
                    }
                },
                resolve: {
                    siteList: function (SiteManager) {
                        return SiteManager.getList();
                    },

                    site: function ($stateParams, SiteManager) {
                        var siteId = $stateParams.siteId;

                        if (!siteId) {
                            return null;
                        }

                        return SiteManager.one(siteId).get();
                    },

                    jstags: function (site) {
                        if (!site) {
                            return null;
                        }

                        return site.customGET('jstags');
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