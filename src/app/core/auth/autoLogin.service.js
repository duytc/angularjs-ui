(function () {
    'use strict';

    angular.module('tagcade.core.auth')
        .factory('autoLogin', autoLogin)
    ;

    function autoLogin($state, Auth, sessionStorage) {
        var api = {
            switchToUser: switchToUser,
            switchBackMyAccount: switchBackMyAccount,
            showButtonSwitchBack: showButtonSwitchBack
        };

        //

        return api;

        /**
         *
         * @param userToken
         * @param homeState
         * @param unSavePreToken
         * @returns {promise}
         */
        function switchToUser(userToken, homeState, unSavePreToken) {
            if(!unSavePreToken) {
                sessionStorage.setPreviousToken(Auth.getSession());
            }

            if(!!userToken.settings) {
                sessionStorage.setCurrentSettings(userToken.settings);
            }

            var newSession = Auth.initSession(userToken);
            sessionStorage.setCurrentToken(newSession.token);

            var stateReload = $state.transitionTo(homeState, {}, {
                reload: true,
                inherit: false,
                notify: true
            });

            return stateReload;
        }

        function switchBackMyAccount(homeState) {
            var previousAuthToken = angular.fromJson(sessionStorage.getPreviousToken());

            switchToUser(previousAuthToken, homeState, true).then(function() {
                sessionStorage.clearPreviousToken();
            });
        }

        function showButtonSwitchBack() {
            return sessionStorage.getPreviousToken() != {} && sessionStorage.getPreviousToken() != undefined;
        }
    }
})();