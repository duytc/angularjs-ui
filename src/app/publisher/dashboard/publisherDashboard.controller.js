(function () {
    'use strict';

    angular
        .module('tagcade.publisher.dashboard')
        .controller('PublisherDashboard', PublisherDashboard)
    ;

    function PublisherDashboard($scope, dashboard) {
        $scope.dashboard = dashboard;
    }
})();