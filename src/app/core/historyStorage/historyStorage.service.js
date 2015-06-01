(function() {
    'use strict';

    angular.module('tagcade.core.historyStorage')
        .factory('historyStorage', historyStorage)
    ;

    function historyStorage($window, $state, HISTORY_STORAGE_AD_SLOT, HISTORY_STORAGE_SITE, HISTORY_STORAGE_PUBLISHER_MANAGEMENT, HISTORY_STORAGE_AD_NETWORK, HISTORY_TYPE_PATH) {
        var api = {
            getLocationPath: getLocationPath,
            setLocationPath: setLocationPath
        };

        return api;

        function getLocationPath(type, defaultState, param) {
            if(type == HISTORY_TYPE_PATH.adSlot && !!_getHistoryCurrentAdSlot()) {
                return $window.location.href = _getHistoryCurrentAdSlot();
            }

            if(type == HISTORY_TYPE_PATH.site && !!_getHistoryCurrentSite()) {
                return $window.location.href = _getHistoryCurrentSite();
            }

            if(type == HISTORY_TYPE_PATH.adNetwork && !!_getHistoryCurrentAdNetwork()) {
                return $window.location.href = _getHistoryCurrentAdNetwork();
            }

            if(type == HISTORY_TYPE_PATH.publisher && !!_getHistoryCurrentPublisherManagement()) {
                return $window.location.href = _getHistoryCurrentPublisherManagement();
            }

            return $state.go(defaultState, param);
        }

        function setLocationPath(type) {
            switch(type) {
                case HISTORY_TYPE_PATH.adSlot:
                    _setHistoryCurrentAdSlot();
                    return;
                case HISTORY_TYPE_PATH.site:
                    _setHistoryCurrentSite();
                    return;
                case HISTORY_TYPE_PATH.adNetwork:
                    _setHistoryCurrentAdNetwork();
                    return;
                case HISTORY_TYPE_PATH.publisher:
                    _setHistoryCurrentPublisherManagement();
                    return;
            }

            console.log('not support type ' + type);
        }

        function _setHistoryCurrentAdSlot() {
            $window.localStorage[HISTORY_STORAGE_AD_SLOT] = $window.location.href;
        }

        function _getHistoryCurrentAdSlot() {
            return $window.localStorage[HISTORY_STORAGE_AD_SLOT];
        }

        function _setHistoryCurrentSite() {
            $window.localStorage[HISTORY_STORAGE_SITE] = $window.location.href;
        }

        function _getHistoryCurrentSite() {
            return $window.localStorage[HISTORY_STORAGE_SITE];
        }

        function _setHistoryCurrentAdNetwork() {
            $window.localStorage[HISTORY_STORAGE_AD_NETWORK] = $window.location.href;
        }

        function _getHistoryCurrentAdNetwork() {
            return $window.localStorage[HISTORY_STORAGE_AD_NETWORK];
        }

        function _setHistoryCurrentPublisherManagement() {
            $window.localStorage[HISTORY_STORAGE_PUBLISHER_MANAGEMENT] = $window.location.href;
        }

        function _getHistoryCurrentPublisherManagement() {
            return $window.localStorage[HISTORY_STORAGE_PUBLISHER_MANAGEMENT];
        }
    }
})();