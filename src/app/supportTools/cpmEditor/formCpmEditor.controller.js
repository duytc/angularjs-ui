(function() {
    'use strict';

    angular.module('tagcade.supportTools.cpmEditor')
        .controller('FormCpmEditor', FormCpmEditor)
    ;

    function FormCpmEditor($scope, adTag, AdTagManager, $modalInstance, $modal, DateFormatter, AlertService) {
        $scope.adTag = adTag;

        $scope.isFormValid = isFormValid;
        $scope.submit = submit;

        $scope.CPM = null;
        $scope.date = {
            startDate: null,
            endDate: null
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
                    $scope.CPM >= 0 &&
                    $scope.date.startDate <= $scope.date.endDate &&
                    $scope.date.startDate != null &&
                    $scope.date.endDate != null &&
                    $scope.date.endDate <= $scope.datePickerOpts.maxDate
        }

        function submit(date, CPM) {
            var confirmUpdate = $modal.open({
                templateUrl: 'supportTools/cpmEditor/confirmUpdateForAdTag.tpl.html'
            });

            confirmUpdate.result.then(function () {
                var start = DateFormatter.getFormattedDate(date.startDate);
                var end = DateFormatter.getFormattedDate(date.endDate);
                var request = AdTagManager.one(adTag.id).customPUT('', 'estcpm', { startDate : start, endDate : end, estCpm : CPM });
                request
                    .then(
                    function () {
                        $modalInstance.close();
                        AlertService.addAlert({
                            type: 'success',
                            message: 'CPM is updated successfully.'
                        });
                    })
                    .catch(
                    function () {
                        $modalInstance.close();
                        AlertService.addAlert({
                            type: 'error',
                            message: 'some error occurs. CPM is not updated.'
                        });
                    });
            });
        }
    }
})();