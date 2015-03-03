(function () {
    'use strict';

    angular
        .module('tagcade.publisher')
        .controller('LayoutHeader', LayoutHeader)
    ;

    function LayoutHeader($scope, autoLogin) {
        $scope.switchBackMyAccount = switchBackMyAccount;
        $scope.showButtonSwitchBack = showButtonSwitchBack;

        function switchBackMyAccount() {
            autoLogin.switchBackMyAccount('app.admin.dashboard');
        }

        function showButtonSwitchBack() {
            return autoLogin.showButtonSwitchBack();
        }
    }
})();