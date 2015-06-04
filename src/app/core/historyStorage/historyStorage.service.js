(function() {
    'use strict';

    angular.module('tagcade.core.historyStorage')
        .factory('historyStorage', historyStorage)
    ;

    function historyStorage($window, $stateParams, $location, $state, HISTORY_TYPE_PATH, HISTORY) {
        var api = {
            getLocationPath: getLocationPath,
            setParamsHistoryCurrent: setParamsHistoryCurrent,

            getParamsHistoryCurrentAdSlot: getParamsHistoryCurrentAdSlot
        };

        $window.localStorage[HISTORY] = $window.localStorage[HISTORY] || '{}';

        return api;

        function getLocationPath(type, state, paramDefault) {
            if(type == HISTORY_TYPE_PATH.adSlot) {
                var params = !!getParamsHistoryCurrentAdSlot() ? getParamsHistoryCurrentAdSlot() : paramDefault;
                return $state.go(state, params);
            }

            if(type == HISTORY_TYPE_PATH.site) {
                return $state.go(state, angular.fromJson($window.localStorage[HISTORY]).site);
            }

            if(type == HISTORY_TYPE_PATH.adNetwork) {
                return $state.go(state, angular.fromJson($window.localStorage[HISTORY]).adNetwork);
            }

            if(type == HISTORY_TYPE_PATH.publisher) {
                return $state.go(state, angular.fromJson($window.localStorage[HISTORY]).publisher);
            }

            console.log('not support type ' + type);
        }

        function setParamsHistoryCurrent(type) {
            var stateParam = _getStateParams();

            switch(type) {
                case HISTORY_TYPE_PATH.adSlot:
                    _setParamsHistoryCurrentAdSlot(stateParam);
                    return;
                case HISTORY_TYPE_PATH.site:
                    _setParamsHistoryCurrentSite(stateParam);
                    return;
                case HISTORY_TYPE_PATH.adNetwork:
                    _setParamsHistoryCurrentAdNetwork(stateParam);
                    return;
                case HISTORY_TYPE_PATH.publisher:
                    _setParamsHistoryCurrentPublisherManagement(stateParam);
                    return;
            }

            console.log('not support type ' + type);
        }

        function _setParamsHistoryCurrentAdSlot(stateParam) {
            var tcHistory = angular.fromJson($window.localStorage[HISTORY]);
            tcHistory.adSlot = stateParam;
            $window.localStorage[HISTORY] = angular.toJson(tcHistory);
        }

        function _setParamsHistoryCurrentSite(stateParam) {
            var tcHistory = angular.fromJson($window.localStorage[HISTORY]);
            tcHistory.site = stateParam;
            $window.localStorage[HISTORY] = angular.toJson(tcHistory);
        }

        function _setParamsHistoryCurrentAdNetwork(stateParam) {
            var tcHistory = angular.fromJson($window.localStorage[HISTORY]);
            tcHistory.adNetwork = stateParam;
            $window.localStorage[HISTORY] = angular.toJson(tcHistory);
        }

        function _setParamsHistoryCurrentPublisherManagement(stateParam) {
            var tcHistory = angular.fromJson($window.localStorage[HISTORY]);
            tcHistory.publisher = stateParam;
            $window.localStorage[HISTORY] = angular.toJson(tcHistory);
        }

        function getParamsHistoryCurrentAdSlot() {
            $window.localStorage[HISTORY] = $window.localStorage[HISTORY] || '{}';

            return angular.fromJson($window.localStorage[HISTORY]).adSlot;
        }

        function _getStateParams() {
            var params = angular.copy($stateParams);
            var search = $location.search();

            angular.forEach(search, function(value, key) {
                params[key] = value;
            });

            return params;
        }
    }
})();