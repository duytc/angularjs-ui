(function() {
    'use strict';

    angular.module('tagcade.reports.performance')
        .controller('popupReportController', popupReportController)
    ;

    function popupReportController($scope, $modal, $modalInstance, data, AdTagManager, AdNetworkManager, UserStateHelper, Auth, reportGroup) {
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

        function openUpdateCpm(type) {
            $modal.open({
                templateUrl: function() {
                    if(type == 'adTag') {
                        return 'supportTools/cpmEditor/formCpmEditorForAdTag.tpl.html';
                    }

                    return 'supportTools/cpmEditor/formCpmEditorForAdNetwork.tpl.html';
                },
                size : 'lg',
                controller: 'FormCpmEditor',
                resolve: {
                    data: function () {
                        return data;
                    },
                    Manager: function() {
                        if(type == 'adTag') {
                            return AdTagManager;
                        }

                        return AdNetworkManager;
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