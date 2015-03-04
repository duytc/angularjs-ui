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

        function switchToUser(userToken, homeState) {
            sessionStorage.setPreviousToken(angular.toJson(Auth.getSession()) || {});

            var newSession = Auth.initSession(userToken);
            sessionStorage.setCurrentToken(newSession.token);

            $state.transitionTo(homeState, {}, {
                reload: true,
                inherit: false,
                notify: true
            });
        }

        function switchBackMyAccount(homeState) {
            var previousAuthToken = angular.fromJson(sessionStorage.getPreviousToken());

            switchToUser(previousAuthToken, homeState);
            sessionStorage.clearPreviousToken();
        }

        function showButtonSwitchBack() {
            return sessionStorage.getPreviousToken() != {} && sessionStorage.getPreviousToken() != undefined;
        }
    }
})();