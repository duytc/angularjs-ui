(function() {
    'use strict';

    angular.module('tagcade.supportTools.updateCpmForAdTags')
        .controller('FormUpdateCpmForAdTags', FormUpdateCpmForAdTags)
    ;

    function FormUpdateCpmForAdTags($scope, adTag, AdTagManager, $modalInstance, $modal, DateFormatter) {
        $scope.adTag = adTag;

        $scope.isFormValid = isFormValid;
        $scope.submit = submit;

        $scope.error = false;
        $scope.CPM = null;
        $scope.date = {
            startDate: null,
            endDate: null
        };

        $scope.datePickerOpts = {
            maxDate:  moment().subtract(1, 'days').endOf('day'),
            ranges: {
                'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                'Last 30 Days': [moment().subtract(29, 'days'), moment()],
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
                templateUrl: 'supportTools/updateCpmForAdTags/confirmUpdate.tpl.html'
            });

            confirmUpdate.result.then(function () {
                var start = DateFormatter.getFormattedDate(date.startDate);
                var end = DateFormatter.getFormattedDate(date.endDate);
                var request = AdTagManager.one(adTag.id).customPUT('', 'estcpm', { startDate : start, endDate : end, estCpm : CPM });
                request
                    .then(
                    function () {
                        return $modalInstance.close();
                    })
                    .catch(
                    function () {
                        return $scope.error = true;
                    });
            });
        }
    }
})();