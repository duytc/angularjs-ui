(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adNetwork')
        .controller('ConfirmPauseForSite', ConfirmPauseForSite)
    ;

    function ConfirmPauseForSite($scope, active) {
        $scope.active = active;
    }
})();