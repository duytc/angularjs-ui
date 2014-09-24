angular.module('tagcade.displayAds.tagManagement.adTag', [
    'ui.router',

    'ui.sortable'
])

    .config(function (UserStateHelperProvider) {
        'use strict';

        UserStateHelperProvider
            .state('tagManagement.adTag', {
                abstract: true,
                url: '/adTags'
            })
            .state('tagManagement.adTag.list', {
                url: '/list/adslot/{adSlotId:[0-9]+}',
                views: {
                    'content@app': {
                        controller: 'AdTagListController',
                        templateUrl: 'displayAds/tagManagement/adTag/views/list.tpl.html'
                    }
                },
                resolve: {
                    adSlot: function ($stateParams, AdSlotManager) {
                        return AdSlotManager.one($stateParams.adSlotId).get();
                    },

                    adTags: function($stateParams, AdSlotManager) {
                        return AdSlotManager.one($stateParams.adSlotId).getList('adtags').then(function (adTags) {
                            return adTags.plain();
                        });
                    }
                },
                breadcrumb: {
                    title: 'Ad Tag List - {{ adSlot.name }} - {{ adSlot.site.name }}'
                }
            })
            .state('tagManagement.adTag.new', {
                url: '/new?adSlotId',
                params: {
                    adSlotId: null
                },
                views: {
                    'content@app': {
                        controller: 'AdTagFormController',
                        templateUrl: 'displayAds/tagManagement/adTag/views/form.tpl.html'
                    }
                },
                resolve: {
                    adTag: function() {
                        return null;
                    },

                    adSlot: function ($stateParams, AdSlotManager) {
                        if (!$stateParams.adSlotId) {
                            return null;
                        }

                        return AdSlotManager.one($stateParams.adSlotId).get().then(function (adSlot) {
                            return adSlot.plain();
                        });
                    },

                    site: function (adSlot) {
                        if (!adSlot) {
                            return null;
                        }

                        return adSlot.site;
                    },

                    publisher: function (site) {
                        if (!site) {
                            return null;
                        }

                        return site.publisher;
                    },

                    siteList: function (SiteManager) {
                        return SiteManager.getList().then(function (sites) {
                            return sites.plain();
                        });
                    },

                    adSlotList: function (SiteManager, site) {
                        if (!site) {
                            return null;
                        }

                        return SiteManager.one(site.id).getList('adslots').then(function (adSlots) {
                            return adSlots.plain();
                        });
                    },

                    adNetworkList: function (AdNetworkManager) {
                        return AdNetworkManager.getList().then(function (adNetworks) {
                            return adNetworks.plain();
                        });
                    }
                },
                customResolve: {
                    admin: {
                        publisherList: function(AdminUserManager) {
                            return AdminUserManager.getList({ filter: 'publisher' }).then(function (users) {
                                return users.plain();
                            });
                        }
                    }
                },
                breadcrumb: {
                    title: 'New Ad Tag'
                }
            })
            .state('tagManagement.adTag.edit', {
                url: '/edit/{id:[0-9]+}',
                views: {
                    'content@app': {
                        controller: 'AdTagFormController',
                        templateUrl: 'displayAds/tagManagement/adTag/views/form.tpl.html'
                    }
                },
                resolve: {
                    adTag: function($stateParams, AdTagManager) {
                        return AdTagManager.one($stateParams.id).get();
                    },

                    adSlot: function (adTag) {
                        return adTag.adSlot;
                    },

                    site: function (adSlot) {
                        return adSlot.site;
                    },

                    publisher: function (site) {
                        return site.publisher;
                    },

                    publisherList: function () {
                        return null;
                    },

                    siteList: function () {
                        return null;
                    },

                    adSlotList: function () {
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