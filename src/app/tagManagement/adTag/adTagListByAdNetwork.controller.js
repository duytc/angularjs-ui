(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adTag')
        .controller('AdTagListByAdNetwork', AdTagListByAdNetwork)
    ;

    function AdTagListByAdNetwork($scope, $translate, $state, $modal, adTags, adNetwork, AdTagManager, AlertService, historyStorage, HISTORY_TYPE_PATH) {
        $scope.adNetwork = adNetwork;
        $scope.adTags = adTags;

        $scope.hasAdTags = function () {
            return !!adTags.length;
        };

        $scope.showPagination = showPagination;
        $scope.backToListAdNetwork = backToListAdNetwork;
        $scope.updateAdTag = updateAdTag;

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10
        };

        if (!$scope.hasAdTags()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: $translate.instant('AD_TAG_MODULE.CURRENTLY_NO_AD_TAG')
            });
        }

        $scope.toggleAdTagStatus = function (adTag) {
            var newTagStatus = !adTag.active;

            AdTagManager.one(adTag.id).patch({
                'active': newTagStatus
            })
                .catch(function () {
                    AlertService.replaceAlerts({
                        type: 'error',
                        message: $translate.instant('AD_TAG_MODULE.CHANGE_STATUS_FAIL')
                    });

                    return $q.reject($translate.instant('AD_TAG_MODULE.CHANGE_STATUS_FAIL'));
                })
                .then(function () {
                    adTag.active = newTagStatus;

                    angular.forEach(adTags, function(adTagChange) {
                        if(adTagChange.libraryAdTag.id == adTag.libraryAdTag.id && adTagChange.adSlot.libraryAdSlot.id == adTag.adSlot.libraryAdSlot.id && adTagChange.adSlot.site.id != adTag.adSlot.site.id) {
                            adTagChange.active = newTagStatus;
                        }
                    });
                })
            ;
        };

        $scope.confirmDeletion = function (adTag) {
            var modalInstance = $modal.open({
                templateUrl: 'tagManagement/adTag/confirmDeletion.tpl.html'
            });

            modalInstance.result.then(function () {
                return AdTagManager.one(adTag.id).remove()
                    .then(
                    function () {
                        historyStorage.getLocationPath(HISTORY_TYPE_PATH.adTagAdNetwork, $state.current);

                        AlertService.addFlash({
                            type: 'success',
                            message: $translate.instant('AD_TAG_MODULE.DELETE_SUCCESS')
                        });
                    },
                    function () {
                        AlertService.replaceAlerts({
                            type: 'danger',
                            message: $translate.instant('AD_TAG_MODULE.DELETE_FAIL')
                        });
                    }
                )
                    ;
            });
        };

        function showPagination() {
            return angular.isArray($scope.adTags) && $scope.adTags.length > $scope.tableConfig.itemsPerPage;
        }

        function backToListAdNetwork() {
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adNetwork, '^.^.adNetwork.list');
        }

        function updateAdTag(data, field, adtag) {
            if(adtag[field] == data) {
                return;
            }

            var item = {};
            item[field] = data;

            AdTagManager.one(adtag.id).patch(item)
                .then(function() {
                    adtag[field] = data;

                    AlertService.addAlert({
                        type: 'success',
                        message: $translate.instant('AD_TAG_MODULE.UPDATE_SUCCESS')
                    });
                })
                .catch(function() {
                    adtag[field] = adtag[field];

                    AlertService.replaceAlerts({
                        type: 'error',
                        message: $translate.instant('AD_TAG_MODULE.UPDATE_FAIL')
                    });
                });
        }

        $scope.$on('$locationChangeSuccess', function() {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.adTagAdNetwork)
        });
    }
})();