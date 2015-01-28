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
                        return 'supportTools/cpmEditor/views/formCpmEditorForAdTag.tpl.html';
                    }

                    return 'supportTools/cpmEditor/views/formCpmEditorForAdNetwork.tpl.html';
                },
                controller: 'FormCpmEditor',
                resolve: {
                    cpmData: function () {
                        return data;
                    },
                    Manager: function() {
                        if(type == 'adTag') {
                            return AdTagManager.one(data.id);
                        }

                        return AdNetworkManager.one(data.id);
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