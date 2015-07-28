(function() {
    'use strict';

    angular.module('tagcade.core.historyStorage')
        .factory('historyStorage', historyStorage)
    ;

    function historyStorage($window, $stateParams, $location, $state, HISTORY_TYPE_PATH, HISTORY, Auth) {
        var api = {
            getLocationPath: getLocationPath,
            setParamsHistoryCurrent: setParamsHistoryCurrent,

            getParamsHistoryForAdSlot: getParamsHistoryForAdSlot
        };

        $window.localStorage[HISTORY] = $window.localStorage[HISTORY] || '{}';

        return api;

        function getLocationPath(type, state, paramDefault) {
            $window.localStorage[HISTORY] = $window.localStorage[HISTORY] || '{}';

            if(type == HISTORY_TYPE_PATH.adSlot) {
                var paramHistoryForAdSlot = getParamsHistoryForAdSlot();
                var params;

                if(Auth.isAdmin) {
                    params = !!paramHistoryForAdSlot && !!paramHistoryForAdSlot.siteId ? paramHistoryForAdSlot : paramDefault;
                } else {
                    params = !!paramHistoryForAdSlot ? paramHistoryForAdSlot : paramDefault;
                }

                if(!params) {
                    params = {
                        uniqueRequestCacheBuster: Math.random()
                    }
                }

                return $state.go(state, params);
            }

            if(!!HISTORY_TYPE_PATH[type]) {
                return $state.go(state, _getHistoryParams(type));
            }

            console.log('not support type ' + type);
        }

        function setParamsHistoryCurrent(type) {
            $window.localStorage[HISTORY] = $window.localStorage[HISTORY] || '{}';
            var stateParam = _getStateParams();

            if(!!HISTORY_TYPE_PATH[type]) {
                return _setParamsHistoryCurrent(stateParam, type);
            }

            console.log('not support type ' + type);
        }

        function _setParamsHistoryCurrent(stateParam, type) {
            var tcHistory = angular.fromJson($window.localStorage[HISTORY]);
            tcHistory[type] = stateParam;
            $window.localStorage[HISTORY] = angular.toJson(tcHistory);
        }

        function getParamsHistoryForAdSlot() {
            $window.localStorage[HISTORY] = $window.localStorage[HISTORY] || '{}';

            return _getHistoryParams(HISTORY_TYPE_PATH.adSlot);
        }

        function _getStateParams() {
            var params = angular.copy($stateParams);
            var search = $location.search();

            angular.forEach(search, function(value, key) {
                params[key] = value;
            });

            return params;
        }

        function _getHistoryParams(historyParams) {
            if(!$window.localStorage[HISTORY]) {
                return null;
            }

            var params = angular.fromJson($window.localStorage[HISTORY])[historyParams];

            if(!!params) {
                params.uniqueRequestCacheBuster = Math.random();
            }
            if(!params) {
                params = {
                    uniqueRequestCacheBuster: Math.random()
                }
            }

            return params;
        }
    }
})();