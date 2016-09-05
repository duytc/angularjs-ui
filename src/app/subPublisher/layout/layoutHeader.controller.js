(function () {
    'use strict';

    angular
        .module('tagcade.publisher')
        .controller('LayoutHeaderSubPublisher', LayoutHeaderSubPublisher)
    ;

    function LayoutHeaderSubPublisher($scope, autoLogin) {
        $scope.switchBackToPublisherAccount = switchBackToPublisherAccount;
        $scope.showButtonSwitchBackToAdmin = showButtonSwitchBackToAdmin;

        function switchBackToPublisherAccount() {
            autoLogin.switchBackMyAccount('app.publisher.subPublisher.list');
        }

        function showButtonSwitchBackToAdmin() {
            return autoLogin.showButtonSwitchBack();
        }
    }
})();