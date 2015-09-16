(function() {
    'use strict';

    angular.module('tagcade.tagManagement.channel')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        // uniqueRequestCacheBuster is used as a work-around for reloading only the current state
        // currently UI-Router will reload all parent states as well, this causes problems having

        UserStateHelperProvider
            .state('tagManagement.channel', {
                abstract: true,
                url: '/channels',
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('tagManagement.channel.list', {
                url: '/list?page&sortField&orderBy&search',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'ChannelList',
                        templateUrl: 'tagManagement/channel/channelList.tpl.html'
                    }
                },
                resolve: {
                    channels: /* @ngInject */ function(ChannelManager) {
                        return ChannelManager.getList().then(function (channels) {
                            return channels.plain();
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Channels'
                }
            })
            .state('tagManagement.channel.new', {
                url: '/new',
                views: {
                    'content@app': {
                        controller: 'ChannelForm',
                        templateUrl: 'tagManagement/channel/channelForm.tpl.html'
                    }
                },
                resolve: {
                    channel: function() {
                        return null;
                    },
                    sites: /* @ngInject */ function(SiteManager) {
                        return SiteManager.getList().then(function (users) {
                            return users.plain();
                        });
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
                    label: 'New Channel'
                }
            })
            .state('tagManagement.channel.edit', {
                url: '/edit/{id:[0-9]+}',
                views: {
                    'content@app': {
                        controller: 'ChannelForm',
                        templateUrl: 'tagManagement/channel/channelForm.tpl.html'
                    }
                },
                resolve: {
                    channel: /* @ngInject */ function($stateParams, ChannelManager) {
                        return ChannelManager.one($stateParams.id).get();
                    },
                    sites: function() {
                        return null;
                    },
                    publishers: function() {
                        return null;
                    }
                },
                ncyBreadcrumb: {
                    label: 'Edit Channel - {{ channel.name }}'
                }
            })

            .state('tagManagement.channel.siteList', {
                url: '/channel/{id:[0-9]+}/sites?page&sortField&orderBy&search',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'ChannelSiteList',
                        templateUrl: 'tagManagement/channel/channelSiteList.tpl.html'
                    }
                },
                resolve: {
                    channel: /* @ngInject */ function(ChannelManager, $stateParams) {
                        return ChannelManager.one($stateParams.id).get().then(function (channel) {
                            return channel.plain();
                        });
                    },
                    sites: /* @ngInject */ function(ChannelManager, $stateParams) {
                        return ChannelManager.one($stateParams.id).getList('sites').then(function (sites) {
                            return sites.plain();
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Sites - {{ channel.name }}'
                }
            })
        ;
    }
})();