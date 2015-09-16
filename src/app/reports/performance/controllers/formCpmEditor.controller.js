(function() {
    'use strict';

    angular.module('tagcade.reports.performance')
        .controller('FormCpmEditor', FormCpmEditor)
    ;

    function FormCpmEditor($scope, $translate, $modalInstance, cpmData, Manager, DateFormatter, AlertService, startDate, endDate) {
        $scope.cpmData = cpmData;

        $scope.isFormValid = isFormValid;
        $scope.submit = submit;

        $scope.CPM = null;
        $scope.date = {
            startDate: (startDate != null) ? new Date(startDate) : null,
            endDate: (endDate != null) ? new Date(endDate) : null
        };

        $scope.datePickerOpts = {
            maxDate: moment().subtract(1, 'days').endOf('day'),
            ranges: {
                'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            }
        };

        function isFormValid() {
            return  $scope.CPM != null &&
                    $scope.date.startDate != null &&
                    $scope.date.endDate != null &&
                    $scope.CPM >= 0 &&
                    $scope.date.startDate <= $scope.date.endDate &&
                    $scope.date.endDate <= $scope.datePickerOpts.maxDate
        }

        function submit(date, CPM) {
            AlertService.removeAlert();

            var start = DateFormatter.getFormattedDate(date.startDate);
            var end = DateFormatter.getFormattedDate(date.endDate);

            var request = Manager.customPUT('', 'estcpm', { startDate : start, endDate : end, estCpm : CPM });
            request
                .then(
                function () {
                    $modalInstance.close();
                    AlertService.addAlert({
                        type: 'success',
                        message: $translate.instant('PERFORMANCE_REPORT_MODULE.UPDATE_CPM_SUCCESS')
                    });
                })
                .catch(
                function () {
                    $modalInstance.close();
                    AlertService.addAlert({
                        type: 'error',
                        message: $translate.instant('PERFORMANCE_REPORT_MODULE.UPDATE_CPM_FAIL')
                    });
                });
        }
    }
})();