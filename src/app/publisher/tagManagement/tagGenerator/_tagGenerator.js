angular.module('tagcade.publisher.tagManagement.tagGenerator', [
    'ui.router'
])

    .config(function ($stateProvider) {
        'use strict';

        $stateProvider
            .state('app.publisher.tagManagement.tagGenerator', {
                url: '/generateTags?siteId',
                params: {
                    siteId: null
                },
                views: {
                    'content@app': {
                        controller: 'PublisherTagGeneratorController',
                        templateUrl: 'publisher/tagManagement/tagGenerator/views/tagGenerator.tpl.html'
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