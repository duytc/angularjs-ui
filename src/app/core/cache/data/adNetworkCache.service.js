(function () {
    'use strict';

    angular.module('tagcade.core.cache')
        .factory('AdNetworkCache', AdNetworkCache)
    ;

    function AdNetworkCache($filter, CacheFactory, AdNetworkManager, _, Auth, sessionStorage) {
        var api = {
            getAllAdNetworks: getAllAdNetworks,
            getAdNetworkById: getAdNetworkById,
            patchAdNetwork: patchAdNetwork,
            postAdNetwork: postAdNetwork,

            removeCacheAdNetwork: removeCacheAdNetwork,
            updateAdNetwork: updateAdNetwork
        };

        var adNetworkCache;

        if (!CacheFactory.get('adNetworkCache')) {
            adNetworkCache = CacheFactory('adNetworkCache', {
                maxAge: 30 * 1000, // cache expire after 60 minutes
                cacheFlushInterval: 60 * 60 * 1000, // This cache will clear itself every hour.
                deleteOnExpire: 'aggressive', // Items will be deleted from this cache right when they expire.
                storageMode: 'localStorage' // This cache will use `localStorage`.
            });
        }

        return api;

        function getAllAdNetworks() {
            var adNetworkList = adNetworkCache.get('adNetworkList');

            if(!Auth.isAdmin() && !Auth.isSubPublisher() && !!adNetworkList) {
                return $filter('selectedPublisher')(adNetworkList, Auth.getSession().id)
            }

            if(!!adNetworkList) {
                return adNetworkList;
            }

            return AdNetworkManager.getList()
                .then(function(adNetworkList) {
                    var previousToken =  angular.fromJson(sessionStorage.getPreviousToken());
                    if(!angular.isObject(previousToken)) {
                        adNetworkCache.put('adNetworkList', adNetworkList);
                    }

                    return adNetworkList;
                });
        }

        function getAdNetworkById(id) {
            var adNetworkList = adNetworkCache.get('adNetworkList');

            if(!!adNetworkList) {
                var idx = _.findLastIndex(adNetworkList, {id: parseFloat(id) });

                return {
                    id: adNetworkList[idx].id,
                    name: adNetworkList[idx].name,
                    publisher: adNetworkList[idx].publisher,
                    url: adNetworkList[idx].url,
                    pausedAdTagsCount: adNetworkList[idx].pausedAdTagsCount,
                    activeAdTagsCount: adNetworkList[idx].activeAdTagsCount
                };
            }

            return AdNetworkManager.one(id).get();
        }

        function patchAdNetwork(data) {
            var adNetwork = angular.copy(data);
            var adNetworkId = adNetwork.id;
            delete adNetwork.pausedAdTagsCount;
            delete adNetwork.activeAdTagsCount;

            return AdNetworkManager.one(adNetworkId).patch(adNetwork)
                .then(function() {
                    updateAdNetwork(data);
                });
        }

        function postAdNetwork(adNetwork) {
            return AdNetworkManager.post(adNetwork)
                .then(function() {
                    removeCacheAdNetwork();
                });
        }

        function updateAdNetwork(adNetwork) {
            var adNetworkList = adNetworkCache.get('adNetworkList');

            if(!adNetworkList) {
                return;
            }

            var idx = _.findLastIndex(adNetworkList, {id: parseFloat(adNetwork.id) });

            // update adNetwork list
            if(!!adNetworkList && idx > -1) {
                angular.extend(adNetworkList[idx], adNetwork);
                adNetworkCache.put('adNetworkList', adNetworkList);
            }
        }

        function removeCacheAdNetwork() {
            adNetworkCache.remove('adNetworkList');
        }
    }
})();