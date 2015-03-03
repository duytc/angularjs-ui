(function () {
    'use strict';

    angular
        .module('tagcade.publisher')
        .controller('LayoutHeader', LayoutHeader)
    ;

    function LayoutHeader($scope, autoLogin) {
        $scope.switchBackToAdminAccount = switchBackToAdminAccount;
        $scope.showButtonSwitchBackToAdmin = showButtonSwitchBackToAdmin;

        function switchBackToAdminAccount() {
            autoLogin.switchBackMyAccount('app.admin.publisherManagement.list');
        }

        function showButtonSwitchBackToAdmin() {
            return autoLogin.showButtonSwitchBack();
        }
    }
})();