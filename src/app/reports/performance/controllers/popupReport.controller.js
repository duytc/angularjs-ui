(function() {
    'use strict';

    angular.module('tagcade.reports.performance')
        .controller('popupReportController', popupReportController)
    ;

    function popupReportController($scope, $modal, $modalInstance, data, UserStateHelper, AlertService, Auth) {
        $scope.isAdmin = Auth.isAdmin();

        $scope.data = data;
        $scope.edit = edit;
        $scope.updateCpm = updateCpm;

        function edit(baseState) {
            UserStateHelper.transitionRelativeToBaseState(baseState, {id: data.id})
                .then(function() {
                    $modalInstance.close();
                })
                .catch(function(error) {
                    AlertService.replaceAlerts({
                        type: 'error',
                        message: 'Edit page may not exist.'
                    });
                })
            ;
        }

        function updateCpm() {
            $modal.open({
                templateUrl: 'supportTools/cpmEditor/formCpmEditorForAdTag.tpl.html',
                size : 'lg',
                controller: 'FormCpmEditor',
                resolve: {
                    adTag: function () {
                        return data;
                    }
                }
            })
        }
    }
})();