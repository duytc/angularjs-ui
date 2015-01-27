(function() {
    'use strict';

    angular.module('tagcade.supportTools.cpmEditor')
        .controller('CpmEditor', CpmEditor)
    ;

    function CpmEditor($scope, $modal, publishers, AdTagManager, adNetworks, AdNetworkManager, userSession, Auth, UISelectMethod) {
        $scope.publishers = publishers;
        $scope.adNetworks = null;
        $scope.sites = null;

        var isAdmin = Auth.isAdmin();
        $scope.isAdmin = isAdmin;

        if(!isAdmin) {
            $scope.adNetworks = adNetworks;
        }

        $scope.selected = {
            publisher : null,
            adNetwork : null
        };

        $scope.showPagination = showPagination;
        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10
        };

        $scope.openUpdateCpm = openUpdateCpm;
        $scope.selectPublisher = selectPublisher;
        $scope.selectAdNetwork = selectAdNetwork;
        $scope.groupEntities = UISelectMethod.groupEntities;
        $scope.isFormValid = isFormValid;
        $scope.getListAdTag = getListAdTag;

        function selectPublisher() {
            $scope.selected.adNetwork = null;
            $scope.adNetworks = adNetworks;
        }

        function selectAdNetwork(adNetwork) {
            $scope.selected.site = null;
            return AdNetworkManager.one(adNetwork.id).one('sites').one('active').getList()
                .then(function (data) {
                    UISelectMethod.addAllOption(data, 'All Site');
                    $scope.sites = data.plain();
            });
        }

        function isFormValid() {
            if (!isAdmin) {
                return $scope.selected.adNetwork != null;
            }

            return $scope.selected.adNetwork != null && $scope.selected.publisher != null;
        }

        function getListAdTag() {
            if(!isAdmin) {
                $scope.selected.publisher = userSession.id;
            }

            if(!$scope.selected.site) {
                AdNetworkManager.one($scope.selected.adNetwork).one('adtags').one('active').getList()
                    .then(function (data) {
                        $scope.adTags = data.plain();
                    })
                ;
            }
            else {
                AdNetworkManager.one($scope.selected.adNetwork).one('sites', $scope.selected.site).one('adtags').one('active').getList()
                    .then(function (data) {
                        $scope.adTags = data.plain();
                    })
                ;
            }
        }

        function openUpdateCpm(data) {
            $modal.open({
                templateUrl: 'supportTools/cpmEditor/formCpmEditorForAdTag.tpl.html',
                size : 'lg',
                controller: 'FormCpmEditor',
                resolve: {
                    data: function () {
                        return data;
                    },
                    Manager: function() {
                        return AdTagManager;
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
            return angular.isArray($scope.adTags) && $scope.adTags.length > $scope.tableConfig.itemsPerPage;
        }
    }
})();