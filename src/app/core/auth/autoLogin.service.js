(function () {
    'use strict';

    angular.module('tagcade.core.auth')
        .factory('autoLogin', autoLogin)
    ;

    function autoLogin($state, Auth, storage) {
        var api = {
            switchToUser: switchToUser,
            switchBackMyAccount: switchBackMyAccount,
            showButtonSwitchBack: showButtonSwitchBack
        };

        //

        return api;

        function switchToUser(userToken, homeState) {
            storage.setPreviousToken(angular.toJson(Auth.getSession()) || {});

            var newSession = Auth.initSession(userToken);
            storage.setCurrentToken(newSession.token);

            $state.transitionTo(homeState, {}, {
                reload: true,
                inherit: false,
                notify: true
            });
        }

        function switchBackMyAccount(homeState) {
            var previousAuthToken = angular.fromJson(storage.getPreviousToken());

            switchToUser(previousAuthToken, homeState);
        }

        function showButtonSwitchBack() {
            return storage.getPreviousToken() != {} && storage.getPreviousToken() != undefined;
        }
    }
})();