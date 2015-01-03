(function () {
   'use strict';

    angular
        .module('tagcade.supportTools.activityLog')
        .controller('ActivityLog', ActivityLog)
    ;

    function ActivityLog($scope, logs, $stateParams, UserStateHelper, AlertService, DateFormatter) {
        var NUM_DISPLAY_PAGE = 7;
        $scope.chooseShowNumberRecords = [30, 50, 100, 200, 500];

        $scope.dataLogs = logs.logsList;

        $scope.getLogs = getLogs;

        $scope.itemsPerPage = $stateParams.rowLimit;
        $scope.bigCurrentPage = setBigCurrentPage();
        $scope.bigTotalItems = logs.numRows;
        $scope.numDisplayPage = NUM_DISPLAY_PAGE;

        $scope.date = {
            startDate: $stateParams.startDate,
            endDate: $stateParams.endDate
        };
        $scope.datePickerOpts = {
            maxDate:  moment().endOf('day'),
            ranges: {
                'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            }
        };

        function setBigCurrentPage() {
            var rowOff = $stateParams.rowOffset;
            if(!rowOff || rowOff < 1) {
                return 1;
            }

            return Math.floor(rowOff/$scope.itemsPerPage)+1;
        }

        function getLogs(date) {
            var params = {
                startDate: DateFormatter.getFormattedDate(date.startDate),
                endDate: DateFormatter.getFormattedDate(date.endDate),
                rowLimit: $scope.itemsPerPage
            };

            UserStateHelper.transitionRelativeToBaseState('supportTools.activityLog.list', params)
                .catch(function(error) {
                    AlertService.replaceAlerts({
                        type: 'error',
                        message: 'An error occurred while doing request'
                    });
                })
            ;
        }
    }
})();