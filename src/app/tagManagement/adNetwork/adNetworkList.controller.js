(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adNetwork')
        .controller('AdNetworkList', AdNetworkList)
    ;

    function AdNetworkList($scope, $modal, $q, AlertService, AdNetworkManager, adNetworks) {
        $scope.adNetworks = adNetworks;

        $scope.hasData = function () {
            return !!adNetworks.length;
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: 'There is currently no ad networks'
            });
        }

        $scope.showPagination = showPagination;
        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10
        };

        $scope.toggleAdNetworkStatus = function (adNetwork) {
            var newStatus = !adNetwork.active;

            var isPause = !newStatus;

            var dfd = $q.defer();

            dfd.promise
                .then(function () {
                    return AdNetworkManager.one(adNetwork.id).patch({ 'active': newStatus })
                        .catch(function () {
                            AlertService.replaceAlerts({
                                type: 'error',
                                message: 'Could not change ad network status'
                            });

                            return $q.reject('could not update ad network status');
                        })
                        .then(function () {
                            adNetwork.active = newStatus;

                            var successMessage;

                            if (isPause) {
                                successMessage = 'The ad network has been paused. There may be a short delay before the associated ad tags are paused.';
                            } else {
                                successMessage = 'The ad network has been activated';
                            }

                            AlertService.replaceAlerts({
                                type: 'success',
                                message: successMessage
                            });
                        })
                    ;
                }
            );

            if (isPause) {
                var modalInstance = $modal.open({
                    templateUrl: 'tagManagement/adNetwork/confirmPause.tpl.html'
                });

                modalInstance.result.then(function () {
                    dfd.resolve();
                });
            } else {
                // if it is not a pause, proceed without a modal
                dfd.resolve();
            }
        };

        $scope.openListSitesForAdNetwork = function (adNetwork) {
            AdNetworkManager.one(adNetwork.id).one('sites').getList()
                .then(function(data) {
                    var sitesForAdNetwork = data.plain();

                    if(!sitesForAdNetwork.length) {
                        AlertService.addAlert({
                            type: 'warning',
                            message: 'Ad network : ' + adNetwork.name + ' does not have sites'
                        });

                        return;
                    }

                    $modal.open({
                        templateUrl: 'tagManagement/adNetwork/sitesForAdNetwork.tpl.html',
                        size: 'lg',
                        controller: 'SitesForAdNetwork',
                        resolve: {
                            sites: function () {
                                return sitesForAdNetwork;
                            },
                            adNetwork: function(){
                                return adNetwork;
                            }
                        }
                    });

                });
        };

        function showPagination() {
            return angular.isArray($scope.adNetworks) && $scope.adNetworks.length > $scope.tableConfig.itemsPerPage;
        }
    }
})();