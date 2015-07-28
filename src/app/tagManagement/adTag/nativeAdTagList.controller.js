(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adTag')
        .controller('NativeAdTagList', NativeAdTagList)
    ;

    function NativeAdTagList($scope, $state, $modal, adTags, AdTagManager, AlertService, adSlot, historyStorage, HISTORY_TYPE_PATH, TYPE_AD_SLOT) {
        $scope.adSlot = adSlot;
        $scope.adTags = adTags;

        $scope.hasAdTags = function () {
            return !!adTags.length;
        };

        $scope.adSlotTypes = TYPE_AD_SLOT;
        $scope.showPagination = showPagination;
        $scope.backToListAdSlot = backToListAdSlot;
        $scope.updateAdTag = updateAdTag;
        $scope.shareAdTag = shareAdTag;

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10
        };

        if (!$scope.hasAdTags()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: 'There is currently no ad tags in this ad slot'
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
                        message: 'Could not change ad tag status'
                    });

                    return $q.reject('could not update ad tag status');
                })
                .then(function () {
                    adTag.active = newTagStatus;
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
                        $state.reload();

                        AlertService.addFlash({
                            type: 'success',
                            message: 'The ad tag was deleted'
                        });
                    },
                    function () {
                        AlertService.replaceAlerts({
                            type: 'danger',
                            message: 'The ad tag could not be deleted'
                        });
                    }
                )
                    ;
            });
        };

        function showPagination() {
            return angular.isArray($scope.adTags) && $scope.adTags.length > $scope.tableConfig.itemsPerPage;
        }

        function backToListAdSlot() {
            if(!!$scope.adSlot.libType) {
                return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adSlotLibrary, '^.^.^.tagLibrary.adSlot.list');
            }

            if($scope.isAdmin()) {
                return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adSlot, '^.^.adSlot.list', {siteId: adSlot.site.id});
            }

            var historyAdSlot = historyStorage.getParamsHistoryForAdSlot();
            if(!!historyAdSlot && !!historyAdSlot.siteId) {
                return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adSlot, '^.^.adSlot.list');
            }

            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adSlot, '^.^.adSlot.listAll');
        }

        function updateAdTag(data, field, adtag) {
            adtag.libraryAdTag.adNetwork = adtag.libraryAdTag.adNetwork.id ? adtag.libraryAdTag.adNetwork.id : adtag.libraryAdTag.adNetwork;

            if(adtag[field] == data) {
                return;
            }

            if(adtag[field] == data) {
                return;
            }

            var saveField = angular.copy(adtag[field]);
            adtag[field] = data;
            var item = angular.copy(adtag);

            AdTagManager.one(item.id).patch(item)
                .then(function() {
                    AlertService.addAlert({
                        type: 'success',
                        message: 'The ad tag has been updated'
                    });
                })
                .catch(function() {
                    adtag[field] = saveField;

                    AlertService.replaceAlerts({
                        type: 'error',
                        message: 'The ad tag has not been updated'
                    });
                });
        }

        function shareAdTag(adTag) {
            $modal.open({
                templateUrl: 'tagManagement/adTag/shareAdTag.tpl.html',
                size: 'lg',
                controller: 'ShareAdTag',
                resolve: {
                    adTag: function () {
                        return adTag;
                    }
                }
            });

            //var libraryAdTag = {
            //    visible: true
            //};
            //
            //AdTagManager.one(adTag.id).patch({libraryAdTag: libraryAdTag})
            //    .then(function () {
            //        adTag.libraryAdTag.visible = true;
            //
            //        AlertService.replaceAlerts({
            //            type: 'success',
            //            message: 'The ad tag has not been moved to library'
            //        });
            //    })
            //    .catch(function () {
            //        AlertService.replaceAlerts({
            //            type: 'error',
            //            message: 'The ad tag has been moved to library'
            //        });
            //    })
            //;
        }
    }
})();