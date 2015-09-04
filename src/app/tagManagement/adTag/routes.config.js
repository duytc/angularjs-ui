(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adTag')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider, USER_MODULES) {
        UserStateHelperProvider
            .state('tagManagement.adTag', {
                abstract: true,
                url: '/adTags',
                data: {
                    requiredModule: USER_MODULES.displayAds
                },
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('tagManagement.adTag.list', {
                url: '/list/adslot/{adSlotId:[0-9]+}',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'AdTagList',
                        templateUrl: 'tagManagement/adTag/adTagList.tpl.html'
                    }
                },
                resolve: {
                    adSlot: /* @ngInject */ function ($stateParams, DisplayAdSlotManager) {
                        return DisplayAdSlotManager.one($stateParams.adSlotId).get();
                    },

                    adTags: /* @ngInject */ function($stateParams, DisplayAdSlotManager) {
                        return DisplayAdSlotManager.one($stateParams.adSlotId).getList('adtags').then(function (adTags) {
                            return adTags.plain();
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Ad Tags - {{ adSlot.libraryAdSlot.name }}'
                }
            })
            .state('tagManagement.adTag.nativeList', {
                url: '/list/nativeadslot/{adSlotId:[0-9]+}',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'NativeAdTagList',
                        templateUrl: 'tagManagement/adTag/nativeAdTagList.tpl.html'
                    }
                },
                resolve: {
                    adSlot: /* @ngInject */ function ($stateParams, NativeAdSlotManager) {
                        return NativeAdSlotManager.one($stateParams.adSlotId).get();
                    },

                    adTags: /* @ngInject */ function($stateParams, NativeAdSlotManager) {
                        return NativeAdSlotManager.one($stateParams.adSlotId).getList('adtags').then(function (adTags) {
                            return adTags.plain();
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Ad Tags - {{ adSlot.libraryAdSlot.name }}'
                }
            })
            .state('tagManagement.adTag.listByAdNetwork', {
                url: '/list/adNetwork/{adNetworkId:[0-9]+}?page&sortField&orderBy&search',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'AdTagListByAdNetwork',
                        templateUrl: 'tagManagement/adTag/adTagListByAdNetwork.tpl.html'
                    }
                },
                resolve: {
                    adNetwork: /* @ngInject */ function ($stateParams, AdNetworkManager) {
                        return AdNetworkManager.one($stateParams.adNetworkId).get();
                    },

                    adTags: /* @ngInject */ function($stateParams, AdNetworkManager) {
                        return AdNetworkManager.one($stateParams.adNetworkId).getList('adtags').then(function (adTags) {
                            return adTags.plain();
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Ad Tags By Ad Network- {{ adNetwork.name }}'
                }
            })
            .state('tagManagement.adTag.new', {
                url: '/new?adSlotId',
                views: {
                    'content@app': {
                        controller: 'AdTagForm',
                        templateUrl: 'tagManagement/adTag/adTagForm.tpl.html'
                    }
                },
                resolve: {
                    adTag: function() {
                        return null;
                    },

                    adSlot: /* @ngInject */ function ($stateParams, AdSlotManager) {
                        if (!$stateParams.adSlotId) {
                            return null;
                        }

                        return AdSlotManager.one($stateParams.adSlotId).get().then(function (adSlot) {
                            return adSlot.plain();
                        });
                    },

                    site: /* @ngInject */ function (adSlot) {
                        if (!adSlot) {
                            return null;
                        }

                        return adSlot.site;
                    },

                    publisher: /* @ngInject */ function (site) {
                        if (!site) {
                            return null;
                        }

                        return site.publisher;
                    },

                    siteList: /* @ngInject */ function (SiteManager) {
                        return SiteManager.getList().then(function (sites) {
                            return sites.plain();
                        });
                    },

                    adSlotList: /* @ngInject */ function (SiteManager, site) {
                        if (!site) {
                            return null;
                        }

                        return SiteManager.one(site.id).getList('adslots').then(function (adSlots) {
                            return adSlots.plain();
                        });
                    },

                    adNetworkList: /* @ngInject */ function (AdNetworkManager) {
                        return AdNetworkManager.getList().then(function (adNetworks) {
                            return adNetworks.plain();
                        });
                    }
                },
                customResolve: {
                    admin: {
                        publisherList: /* @ngInject */ function(adminUserManager) {
                            return adminUserManager.getList({ filter: 'publisher' }).then(function (users) {
                                return users.plain();
                            });
                        }
                    }
                },
                ncyBreadcrumb: {
                    label: 'New Ad Tag'
                }
            })
            .state('tagManagement.adTag.nativeNew', {
                url: '/nativeNew?adSlotId',
                views: {
                    'content@app': {
                        controller: 'AdTagForm',
                        templateUrl: 'tagManagement/adTag/adTagForm.tpl.html'
                    }
                },
                resolve: {
                    adTag: function() {
                        return null;
                    },

                    adSlot: /* @ngInject */ function ($stateParams, NativeAdSlotManager) {
                        if (!$stateParams.adSlotId) {
                            return null;
                        }

                        return NativeAdSlotManager.one($stateParams.adSlotId).get().then(function (adSlot) {
                            return adSlot.plain();
                        });
                    },

                    site: /* @ngInject */ function (adSlot) {
                        if (!adSlot) {
                            return null;
                        }

                        return adSlot.site;
                    },

                    publisher: /* @ngInject */ function (site) {
                        if (!site) {
                            return null;
                        }

                        return site.publisher;
                    },

                    siteList: /* @ngInject */ function (SiteManager) {
                        return SiteManager.getList().then(function (sites) {
                            return sites.plain();
                        });
                    },

                    adSlotList: /* @ngInject */ function (SiteManager, site) {
                        if (!site) {
                            return null;
                        }

                        return SiteManager.one(site.id).getList('adslots').then(function (adSlots) {
                            return adSlots.plain();
                        });
                    },

                    adNetworkList: /* @ngInject */ function (AdNetworkManager) {
                        return AdNetworkManager.getList().then(function (adNetworks) {
                            return adNetworks.plain();
                        });
                    }
                },
                customResolve: {
                    admin: {
                        publisherList: /* @ngInject */ function(adminUserManager) {
                            return adminUserManager.getList({ filter: 'publisher' }).then(function (users) {
                                return users.plain();
                            });
                        }
                    }
                },
                ncyBreadcrumb: {
                    label: 'New Ad Tag'
                }
            })
            .state('tagManagement.adTag.edit', {
                url: '/edit/{id:[0-9]+}?adNetworkId&adSlotId&adSlotType',
                views: {
                    'content@app': {
                        controller: 'AdTagForm',
                        templateUrl: 'tagManagement/adTag/adTagForm.tpl.html'
                    }
                },
                resolve: {
                    adTag: /* @ngInject */ function($stateParams, AdTagManager) {
                        return AdTagManager.one($stateParams.id).get();
                    },

                    adSlot: /* @ngInject */ function (adTag) {
                        return adTag.adSlot;
                    },

                    site: /* @ngInject */ function (adSlot) {
                        if(!!adSlot && !!adSlot.site) {
                            return adSlot.site;
                        }

                        return null
                    },

                    publisher: /* @ngInject */ function (site) {
                        if(!!site && !!site.publisher) {
                            return site.publisher;
                        }

                        return null;
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

                    adNetworkList: /* @ngInject */ function (AdNetworkManager) {
                        return AdNetworkManager.getList().then(function (adNetworks) {
                            return adNetworks.plain();
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Edit Ad Tag - {{ adTag.libraryAdTag.name }}'
                }
            })
        ;
    }
})();