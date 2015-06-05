(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adSlot')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider, USER_MODULES) {
        UserStateHelperProvider
            .state('tagManagement.adSlot', {
                abstract: true,
                url: '/adSlots',
                data: {
                    requiredModule: USER_MODULES.displayAds
                },
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('tagManagement.adSlot.list', {
                url: '/list/site/{siteId:[0-9]+}?page&sortField&orderBy&search',
                views: {
                    'content@app': {
                        controller: 'AdSlotList',
                        templateUrl: 'tagManagement/adSlot/adSlotList.tpl.html'
                    }
                },
                resolve: {
                    // AdSlotManager is provided as a parameter to make sure the service is invoked
                    // because during init it attaches additional behaviour to the adslots resource
                    adSlots: /* @ngInject */ function($stateParams, SiteManager, AdSlotManager) {
                        return SiteManager.one($stateParams.siteId).getList('adslots').then(function (adSlots) {
                            return adSlots.plain();
                        });
                    },
                    dynamicAdSlot: /* @ngInject */ function(SiteManager, $stateParams) {
                        return SiteManager.one($stateParams.siteId).getList('dynamicadslots').then(function (dynamicAdSlots) {
                            return dynamicAdSlots.plain();
                        });
                    },
                    site: /* @ngInject */ function ($stateParams, SiteManager) {
                        return SiteManager.one($stateParams.siteId).get().then(function (site) {
                            return site.plain();
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Ad Slots - {{ site.name }}' // TODO cannot show site variable here, why?
                },
                reloadOnSearch: false
            })
            .state('tagManagement.adSlot.listAll', {
                url: '/list?page&sortField&orderBy&search',
                views: {
                    'content@app': {
                        controller: 'AdSlotList',
                        templateUrl: 'tagManagement/adSlot/adSlotList.tpl.html'
                    }
                },
                resolve: {
                    // AdSlotManager is provided as a parameter to make sure the service is invoked
                    // because during init it attaches additional behaviour to the adslots resource
                    adSlots: /* @ngInject */ function(AdSlotManager) {
                        return AdSlotManager.getList()
                            .then(function(adSlot) {
                                return adSlot.plain();
                            })
                    },
                    dynamicAdSlot: /* @ngInject */ function(DynamicAdSlotManager) {
                        return DynamicAdSlotManager.getList()
                            .then(function(adSlotDynamic) {
                                return adSlotDynamic.plain();
                            })
                    },
                    site: function () {
                        return null;
                    }
                },
                ncyBreadcrumb: {
                    label: 'Ad Slots'
                },
                reloadOnSearch: false
            })
            .state('tagManagement.adSlot.new', {
                url: '/new?siteId',
                views: {
                    'content@app': {
                        controller: 'AdSlotForm',
                        templateUrl: 'tagManagement/adSlot/adSlotForm.tpl.html'
                    }
                },
                resolve: {
                    adSlot: function() {
                        return null;
                    },

                    site: /* @ngInject */ function ($stateParams, SiteManager) {
                        if (!$stateParams.siteId) {
                            return null;
                        }

                        return SiteManager.one($stateParams.siteId).get().then(function (site) {
                            return site.plain();
                        });
                    },

                    siteList: /* @ngInject */ function(SiteManager) {
                        return SiteManager.getList().then(function (sites) {
                            return sites.plain();
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
                    label: 'New Ad Slot'
                }
            })
            .state('tagManagement.adSlot.edit', {
                url: '/edit/{id:[0-9]+}',
                views: {
                    'content@app': {
                        controller: 'AdSlotForm',
                        templateUrl: 'tagManagement/adSlot/adSlotForm.tpl.html'
                    }
                },
                resolve: {
                    adSlot: /* @ngInject */ function($stateParams, AdSlotManager) {
                        return AdSlotManager.one($stateParams.id).get();
                    },

                    site: /* @ngInject */ function (adSlot) {
                        return adSlot.site;
                    },

                    publisherList: function () {
                        return null;
                    },

                    siteList: function() {
                        return null;
                    }
                },
                ncyBreadcrumb: {
                    label: 'Edit Ad Slot - {{ adSlot.name }}'
                }
            })

            .state('tagManagement.adSlot.editDynamic', {
                url: '/editDynamic/{id:[0-9]+}',
                views: {
                    'content@app': {
                        controller: 'AdSlotForm',
                        templateUrl: 'tagManagement/adSlot/adSlotForm.tpl.html'
                    }
                },
                resolve: {
                    adSlot: /* @ngInject */ function($stateParams, DynamicAdSlotManager) {
                        return DynamicAdSlotManager.one($stateParams.id).get();
                    },

                    site: /* @ngInject */ function (adSlot) {
                        return adSlot.site;
                    },

                    publisherList: function () {
                        return null;
                    },

                    siteList: function() {
                        return null;
                    }
                },
                ncyBreadcrumb: {
                    label: 'Edit Ad Slot - {{ adSlot.name }}'
                }
            })
        ;
    }
})();