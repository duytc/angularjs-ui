(function() {
    'use strict';

    angular.module('tagcade.tagManagement.tagGenerator')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        UserStateHelperProvider
            .state('tagManagement.tagGenerator', {
                url: '/generateTags?siteId&channelId',
                views: {
                    'content@app': {
                        controller: 'TagGenerator',
                        templateUrl: 'tagManagement/tagGenerator/tagGenerator.tpl.html'
                    }
                },
                resolve: {
                    channelList: function(ChannelManager) {
                        return ChannelManager.getList();
                    },
                    site: /* @ngInject */ function ($stateParams, SiteManager) {
                        var siteId = $stateParams.siteId;

                        if (!siteId) {
                            return null;
                        }

                        return SiteManager.one(siteId).get();
                    },
                    channel: /* @ngInject */ function ($stateParams, ChannelManager) {
                        var channelId = $stateParams.channelId;

                        if (!channelId) {
                            return null;
                        }

                        return ChannelManager.one(channelId).get();
                    },
                    jstags: /* @ngInject */ function (site, channel) {
                        if (!site && !channel) {
                            return null;
                        }

                        if(!!site) {
                            return site.customGET('jstags', {forceSecure: true});
                        }

                        return channel.customGET('jstags', {forceSecure: true});
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