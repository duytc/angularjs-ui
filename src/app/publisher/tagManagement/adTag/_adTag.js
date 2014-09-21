angular.module('tagcade.publisher.tagManagement.adTag', [
    'ui.router',

    'ui.sortable'
])

    .config(function ($stateProvider) {
        'use strict';

        $stateProvider
            .state('app.publisher.tagManagement.adTag', {
                abstract: true,
                url: '/adTags'
            })
            .state('app.publisher.tagManagement.adTag.list', {
                url: '/list/adslot/{adSlotId:[0-9]+}',
                views: {
                    'content@app': {
                        controller: 'PublisherAdTagListController',
                        templateUrl: 'publisher/tagManagement/adTag/views/list.tpl.html'
                    }
                },
                resolve: {
                    adSlot: function ($stateParams, AdSlotManager) {
                        return AdSlotManager.one($stateParams.adSlotId).get();
                    },

                    site: function (SiteManager, adSlot) {
                        return SiteManager.one(adSlot.site).get().then(function (site) {
                            return site.plain();
                        });
                    },

                    adTags: function($stateParams, AdSlotManager) {
                        return AdSlotManager.one($stateParams.adSlotId).getList('adtags').then(function (adTags) {
                            return adTags.plain();
                        });
                    }
                },
                breadcrumb: {
                    title: 'Ad Tag List - {{ adSlot.name }} - {{ site.name }}'
                }
            })
            .state('app.publisher.tagManagement.adTag.new', {
                url: '/new?adSlotId',
                params: {
                    adSlotId: null
                },
                views: {
                    'content@app': {
                        controller: 'PublisherAdTagFormController',
                        templateUrl: 'publisher/tagManagement/adTag/views/form.tpl.html'
                    }
                },
                resolve: {
                    adTag: function() {
                        return null;
                    },

                    adSlot: function($stateParams, AdSlotManager) {
                        if ($stateParams.adSlotId) {
                            return AdSlotManager.one($stateParams.adSlotId).get().then(function (adSlot) {
                                return adSlot.plain();
                            });
                        }

                        return null;
                    },


                    site: function(SiteManager, adSlot) {
                        if (adSlot) {
                            return SiteManager.one(adSlot.site).get().then(function (site) {
                                return site.plain();
                            });
                        }

                        return null;
                    },

                    siteList: function (SiteManager) {
                        return SiteManager.getList().then(function (sites) {
                            return sites.plain();
                        });
                    },

                    adNetworkList: function (AdNetworkManager) {
                        return AdNetworkManager.getList().then(function (adNetworks) {
                            return adNetworks.plain();
                        });
                    }
                },
                breadcrumb: {
                    title: 'New Ad Tag'
                }
            })
            .state('app.publisher.tagManagement.adTag.edit', {
                url: '/edit/{id:[0-9]+}',
                views: {
                    'content@app': {
                        controller: 'PublisherAdTagFormController',
                        templateUrl: 'publisher/tagManagement/adTag/views/form.tpl.html'
                    }
                },
                resolve: {
                    adTag: function($stateParams, AdTagManager) {
                        return AdTagManager.one($stateParams.id).get();
                    },

                    adSlot: function (AdSlotManager, adTag) {
                        return AdSlotManager.one(adTag.adSlot).get().then(function (adSlot) {
                            return adSlot.plain();
                        });
                    },

                    site: function (SiteManager, adSlot) {
                        return SiteManager.one(adSlot.site).get().then(function (site) {
                            return site.plain();
                        });
                    },

                    siteList: function () {
                        return null;
                    },

                    adNetworkList: function (AdNetworkManager) {
                        return AdNetworkManager.getList().then(function (adNetworks) {
                            return adNetworks.plain();
                        });
                    }
                },
                breadcrumb: {
                    title: 'Edit Ad Tag - {{ adTag.name }}'
                }
            })
        ;
    })

;