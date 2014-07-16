angular.module('tagcadeApp.core')

    .controller('AppController', function($rootScope, $scope, $state, Auth, AUTH_EVENTS, ENTRY_STATE) {
        $scope.username = null;
        $scope.roles = null;
    })

;