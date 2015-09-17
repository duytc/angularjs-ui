(function () {
    'use strict';

    angular.module('tagcade.core.cache')
        .factory('SiteCache', SiteCache)
    ;

    function SiteCache($filter, CacheFactory, SiteManager, _, Auth, sessionStorage) {
        var api = {
            getAllSites: getAllSites,
            getSiteById: getSiteById,
            patchSite: patchSite,
            postSite: postSite,
            deleteSite: deleteSite,

            removeCacheSite: removeCacheSite,
            updateSite: updateSite
        };

        var siteCache;

        if (!CacheFactory.get('siteCache')) {
            siteCache = CacheFactory('siteCache', {
                maxAge: 60 * 60 * 1000, // cache expire after 60 minutes
                cacheFlushInterval: 60 * 60 * 1000, // This cache will clear itself every hour.
                deleteOnExpire: 'aggressive', // Items will be deleted from this cache right when they expire.
                storageMode: 'localStorage' // This cache will use `localStorage`.
            });
        }

        return api;

        function getAllSites() {
            var siteList = siteCache.get('siteList');

            if(!Auth.isAdmin() && !!siteList) {
                return $filter('selectedPublisher')(siteList, Auth.getSession().id)
            }

            if(!!siteList) {
                return siteList;
            }

            return SiteManager.getList()
                .then(function(siteList) {
                    var previousToken =  angular.fromJson(sessionStorage.getPreviousToken());
                    if(!angular.isObject(previousToken)) {
                        siteCache.put('siteList', siteList);
                    }

                    return siteList;
                });
        }

        function getSiteById(id) {
            var siteList = siteCache.get('siteList');

            if(!!siteList) {
                var idx = _.findLastIndex(siteList, {id: parseFloat(id) });

                return {
                    id: siteList[idx].id,
                    name: siteList[idx].name,
                    publisher: siteList[idx].publisher,
                    domain: siteList[idx].domain,
                    players: siteList[idx].players
                };
            }

            return SiteManager.one(id).get();
        }

        function patchSite(data) {
            var site = angular.copy(data);
            var siteId = site.id;

            return SiteManager.one(siteId).patch(site)
                .then(function() {
                    updateSite(data);
                });
        }

        function postSite(site) {
            return SiteManager.post(site)
                .then(function() {
                    removeCacheSite();
                });
        }

        function deleteSite(site) {
            var siteList = siteCache.get('siteList');
            var index = siteList.indexOf(site);

            siteList.splice(index, 1);
            siteCache.put('siteList', siteList);
        }

        function updateSite(site) {
            var siteList = siteCache.get('siteList');
            var idx = _.findLastIndex(siteList, {id: parseFloat(site.id) });

            // update site list
            if(!!siteList && idx > -1) {
                angular.extend(siteList[idx], site);
                siteCache.put('siteList', siteList);
            }
        }

        function removeCacheSite() {
            siteCache.remove('siteList');
        }
    }
})();