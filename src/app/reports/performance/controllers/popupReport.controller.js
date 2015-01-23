(function() {
    'use strict';

    angular.module('tagcade.reports.performance')
        .controller('popupReportController', popupReportController)
    ;

    function popupReportController($scope, $modal, $modalInstance, data, UserStateHelper, Auth, reportGroup) {
        $scope.isAdmin = Auth.isAdmin();

        $scope.data = data;
        $scope.goToEditPage = goToEditPage;
        $scope.openUpdateCpm = openUpdateCpm;

        function goToEditPage(baseState) {
            UserStateHelper.transitionRelativeToBaseState(baseState, {id: data.id})
                .then(function() {
                    $modalInstance.close();
                })
            ;
        }

        function openUpdateCpm() {
            $modal.open({
                templateUrl: 'supportTools/cpmEditor/formCpmEditorForAdTag.tpl.html',
                size : 'lg',
                controller: 'FormCpmEditor',
                resolve: {
                    adTag: function () {
                        return data;
                    },
                    startDate : function() {
                        return reportGroup.startDate;
                    },
                    endDate: function() {
                        return reportGroup.endDate;
                    }
                }
            })
        }
    }
})();