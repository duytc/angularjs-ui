(function() {
    'use strict';

    angular.module('tagcade.supportTools.cpmEditor')
        .controller('CpmEditor', CpmEditor)
    ;

    function CpmEditor($scope, $modal, $stateParams, dataList, AdTagManager, AdNetworkManager, AlertService) {
        $scope.dataList = dataList;

        if(!$scope.dataList.length) {
            AlertService.addAlert({
                type: 'warning',
                message: 'There are no items for that selection'
            });
        }

        $scope.showPagination = showPagination;
        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10
        };

        $scope.openUpdateCpm = openUpdateCpm;

        function openUpdateCpm(dataItem, type) {
            $modal.open({
                templateUrl: function() {
                    if(type == 'adTag') {
                        return 'supportTools/cpmEditor/views/formCpmEditorForAdTag.tpl.html';
                    }
                    if(type == 'site') {
                        return 'supportTools/cpmEditor/views/formCpmEditorForSite.tpl.html';
                    }

                    return 'supportTools/cpmEditor/views/formCpmEditorForAdNetwork.tpl.html';
                },
                controller: 'FormCpmEditor',
                resolve: {
                    cpmData: function () {
                        return dataItem;
                    },
                    Manager: function() {
                        if(type == 'adTag') {
                            return AdTagManager.one(dataItem.id);
                        }
                        if(type == 'site') {
                            return AdNetworkManager.one($stateParams.adNetworkId).one('sites', dataItem.id);
                        }

                        return AdNetworkManager.one(dataItem.id);
                    },
                    startDate : function() {
                        return null;
                    },
                    endDate: function() {
                        return null;
                    }
                }
            })
        }

        function showPagination() {
            return angular.isArray($scope.data) && $scope.data.length > $scope.tableConfig.itemsPerPage;
        }
    }
})();