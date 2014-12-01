(function () {
    'use strict';

    angular
        .module('tagcade.admin.dashboard')
        .controller('AdminDashboard', AdminDashboard)
    ;

    function AdminDashboard($scope, dashboard) {
        $scope.dashboard = dashboard;
    }
})();