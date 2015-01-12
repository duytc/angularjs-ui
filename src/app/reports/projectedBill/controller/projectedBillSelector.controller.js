(function() {
    'use strict';

    angular.module('tagcade.reports.projectedBill')
        .controller('ProjectedBillSelector', ProjectedBillSelector)
    ;

    function ProjectedBillSelector($scope, _, Auth, UserStateHelper, AlertService, projectedBillService, $stateParams) {
        var isAdmin = Auth.isAdmin();
        $scope.isAdmin = isAdmin;

        $scope.optionData = {
            publishers: []
        };

        $scope.getProjectedBill = getProjectedBill;

        init();

        function init() {
            if (isAdmin) {
                projectedBillService.getPublishers()
                    .then(function (users) {
                        $scope.optionData.publishers = users;
                    })
                ;
            }

            if(!$stateParams.publisherId) {
                $scope.selectedData = {
                    publisherId: null
                };
            }
            else {
                $scope.selectedData = {
                    publisherId: $stateParams.publisherId
                };
            }
        }

        function getProjectedBill() {
            var params = $scope.selectedData;

            UserStateHelper.transitionRelativeToBaseState('reports.projectedBill.accounts', params)
                .catch(function(error) {
                    AlertService.replaceAlerts({
                        type: 'error',
                        message: 'An error occurred while requesting the projected bill. Please contact administrator for further instruction.'
                    });
                })
            ;
        }
    }
})();