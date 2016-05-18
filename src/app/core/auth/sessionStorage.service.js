(function () {
    'use strict';

    angular.module('tagcade.core.auth')
        .factory('sessionStorage', sessionStorage)
    ;

    function sessionStorage($window, AUTH_TOKEN_NAME, PREVIOUS_AUTH_TOKEN_NAME, CURRENT_PUBLISHER_SETTINGS) {
        var api = {
            setCurrentToken: setCurrentToken,
            getCurrentToken: getCurrentToken,

            setPreviousToken: setPreviousToken,
            getPreviousToken: getPreviousToken,

            setCurrentSettings: setCurrentSettings,
            getCurrentSettings: getCurrentSettings,

            clearStorage: clearStorage,
            clearPreviousToken: clearPreviousToken
        };

        //

        return api;

        function setCurrentToken(CurrentAuthToken) {
            $window.localStorage[AUTH_TOKEN_NAME] = CurrentAuthToken;
        }

        function getCurrentToken() {
            return $window.localStorage[AUTH_TOKEN_NAME];
        }

        function setPreviousToken(previousAuthToken) {
            var tokenList = angular.fromJson($window.localStorage[PREVIOUS_AUTH_TOKEN_NAME]) || [];
            tokenList.push(previousAuthToken);

            $window.localStorage[PREVIOUS_AUTH_TOKEN_NAME] = angular.toJson(tokenList);
        }

        function getPreviousToken() {
            var listPreviousToken = angular.fromJson($window.localStorage[PREVIOUS_AUTH_TOKEN_NAME]);

            if(angular.isArray(listPreviousToken) && listPreviousToken.length > 0) {
                return listPreviousToken[listPreviousToken.length - 1];
            }

            return null;
        }

        function setCurrentSettings(setCurrentSettings) {
            $window.localStorage[CURRENT_PUBLISHER_SETTINGS] = angular.toJson(setCurrentSettings);
        }

        function getCurrentSettings() {
            return $window.localStorage[CURRENT_PUBLISHER_SETTINGS];
        }

        function clearStorage() {
            $window.localStorage.clear();
        }

        function clearPreviousToken() {
            var listPreviousToken = angular.fromJson($window.localStorage[PREVIOUS_AUTH_TOKEN_NAME]);

            if(angular.isArray(listPreviousToken) && listPreviousToken.length == 1) {
                $window.localStorage.removeItem(PREVIOUS_AUTH_TOKEN_NAME);
            } else {
                listPreviousToken.splice(listPreviousToken.length - 1, 1);
                $window.localStorage[PREVIOUS_AUTH_TOKEN_NAME] = angular.toJson(listPreviousToken);
            }
        }
    }
})();