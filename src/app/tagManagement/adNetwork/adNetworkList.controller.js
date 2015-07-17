(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adNetwork')
        .controller('AdNetworkList', AdNetworkList)
    ;

    function AdNetworkList($scope, $location, $modal, $q, AlertService, AdNetworkManager, adNetworks, AtSortableService, historyStorage, HISTORY_TYPE_PATH) {
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

        $scope.today = new Date();
        $scope.showPagination = showPagination;
        $scope.setCurrentPageForUrl = setCurrentPageForUrl;
        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10,
            currentPage: $location.search().page - 1 || 0
        };

        $scope.toggleAdNetworkStatus = function (adNetwork, newStatus) {
            //var newStatus = !adNetwork.active;

            var isPause = !newStatus;

            var dfd = $q.defer();

            dfd.promise
                .then(function () {
                    return AdNetworkManager.one(adNetwork.id).customPUT(null, 'status', { 'active': newStatus })
                        .catch(function () {
                            AlertService.replaceAlerts({
                                type: 'error',
                                message: 'Could not change ad network status'
                            });

                            return $q.reject('could not update ad network status');
                        })
                        .then(function () {
                            if(newStatus) {
                                adNetwork.activeAdTagsCount += adNetwork.pausedAdTagsCount;
                                adNetwork.pausedAdTagsCount = 0;
                            } else {
                                adNetwork.pausedAdTagsCount += adNetwork.activeAdTagsCount;
                                adNetwork.activeAdTagsCount = 0;
                            }

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

        function setCurrentPageForUrl() {
            AtSortableService.insertParamForUrl({page: $scope.tableConfig.currentPage + 1});
        }

        $scope.$on('$locationChangeSuccess', function() {
            $scope.tableConfig.currentPage = $location.search().page - 1;
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.adNetwork)
        });
    }
})();