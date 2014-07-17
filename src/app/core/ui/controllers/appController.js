angular.module('tagcade.core.ui')

    .controller('AppController', function($scope, userSession) {
        $scope.userSession = userSession || {
            username: null,
            roles: null,
            features: null
        };
    })

;