(function () {
   'use strict';

    angular
        .module('tagcade.supportTools.activityLog')
        .controller('ActivityLog', ActivityLog)
    ;

    function ActivityLog($scope, logs, activityLogs, ROW_LIMIT, DateFormatter) {
        $scope.dataLogs = logs.logsList;

        var initialData = activityLogs.getInitialParams();

        $scope.showTabMenu = initialData.loginLogs;
        $scope.itemsPerPage = initialData.rowLimit;
        $scope.bigCurrentPage = setBigCurrentPage();
        $scope.bigTotalItems = logs.numRows;
        $scope.showPagination = showPagination();

        activityLogs.setInitialShowLoginLogs($scope.showTabMenu);

        $scope.dateFormatter = function(date) {
            return DateFormatter.getFormattedDate(new Date(date));
        };

        function setBigCurrentPage() {
            var rowOff = initialData.rowOffset;
            if(!rowOff || rowOff < 1) {
                return 1;
            }

            return Math.floor(rowOff/$scope.itemsPerPage)+1;
        }

        function showPagination() {
            return angular.isArray($scope.dataLogs) && logs.numRows > ROW_LIMIT;
        }
    }
})();