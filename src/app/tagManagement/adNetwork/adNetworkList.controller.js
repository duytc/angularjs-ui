(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adNetwork')
        .controller('AdNetworkList', AdNetworkList)
    ;

    function AdNetworkList($scope, $translate, $modal, $q, AlertService, AdNetworkManager, AdNetworkCache, adNetworks, historyStorage, HISTORY_TYPE_PATH) {
        $scope.adNetworks = adNetworks;

        $scope.hasData = function () {
            return !!adNetworks.length;
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: $translate.instant('AD_NETWORK_MODULE.CURRENTLY_NO_AD_NETWORK')
            });
        }

        $scope.today = new Date();
        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10
        };

        $scope.showPagination = showPagination;
        $scope.getUnifiedReportEmail = getUnifiedReportEmail;

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
                                message: $translate.instant('AD_NETWORK_MODULE.UPDATE_STATUS_FAIL')
                            });

                            return $q.reject($translate.instant('AD_NETWORK_MODULE.UPDATE_STATUS_FAIL'));
                        })
                        .then(function () {
                            if(newStatus) {
                                adNetwork.activeAdTagsCount += adNetwork.pausedAdTagsCount;
                                adNetwork.pausedAdTagsCount = 0;
                            } else {
                                adNetwork.pausedAdTagsCount += adNetwork.activeAdTagsCount;
                                adNetwork.activeAdTagsCount = 0;
                            }

                            AdNetworkCache.updateAdNetwork(adNetwork);

                            var successMessage;

                            if (isPause) {
                                successMessage = $translate.instant('AD_NETWORK_MODULE.PAUSE_STATUS_SUCCESS');
                            } else {
                                successMessage = $translate.instant('AD_NETWORK_MODULE.ACTIVE_STATUS_SUCCESS');
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
            AdNetworkManager.one(adNetwork.id).one('sites').get({page: 1})
                .then(function(data) {
                    var sitesForAdNetwork = data.plain();

                    if(!sitesForAdNetwork.records.length) {
                        AlertService.replaceAlerts({
                            type: 'warning',
                            message: $translate.instant('AD_NETWORK_MODULE.CURRENTLY_NO_SITES_AD_NETWORK', {ad_network_name: adNetwork.name})
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

        function getUnifiedReportEmail(adNetwork) {
            AdNetworkManager.one(adNetwork.id).one('emailtoken').get()
                .then(function(email) {
                    $modal.open({
                        templateUrl: 'tagManagement/adNetwork/EmailForUnifiedReport.tpl.html',
                        controller: function($scope) {
                            $scope.email = email;
                            $scope.adNetwork = adNetwork;

                            $scope.refreshUnifiedReportEmail = function (adNetwork) {
                                AdNetworkManager.one(adNetwork.id).one('emailtoken').get({resetToken: true})
                                    .then(function(email) {
                                        $scope.email = email;

                                        AlertService.replaceAlerts({
                                            type: 'success',
                                            message: $translate.instant('AD_NETWORK_MODULE.REFRESH_UNIFIED_REPORT_SUCCESS')
                                        });
                                    })
                                    .catch(function() {
                                        AlertService.replaceAlerts({
                                            type: 'error',
                                            message: $translate.instant('AD_NETWORK_MODULE.REFRESH_UNIFIED_REPORT_FAIL')
                                        });
                                    })
                            }
                        }
                    });
                });
        }

        $scope.$on('$locationChangeSuccess', function() {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.adNetwork)
        });
    }
})();