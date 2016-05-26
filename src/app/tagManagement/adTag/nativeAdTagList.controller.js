(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adTag')
        .controller('NativeAdTagList', NativeAdTagList)
    ;

    function NativeAdTagList($scope, $stateParams, $translate, $modal, adTags, AdTagManager, AdSlotAdTagLibrariesManager, AdTagLibrariesManager, AlertService, adSlot, historyStorage, HISTORY_TYPE_PATH, TYPE_AD_SLOT) {
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

        if(!!adSlot.libraryAdSlot && adSlot.libraryAdSlot.visible || adSlot.visible) {
            AlertService.addAlert({
                type: 'warning',
                message: $translate.instant('AD_SLOT_LIBRARY_MODULE.WARNING_EDIT_LIBRARY')
            });
        }

        if (!$scope.hasAdTags()) {
            AlertService.addAlert({
                type: 'warning',
                message: $translate.instant('AD_TAG_MODULE.CURRENTLY_NO_AD_TAG')
            });
        }

        $scope.toggleAdTagStatus = function (adTag) {
            var newTagStatus = !adTag.active;

            var Manager = !!adTag.libraryAdSlot ? AdSlotAdTagLibrariesManager : AdTagManager;
            Manager.one(adTag.id).patch({
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
                })
            ;
        };

        $scope.unLinkAdTag = function (adTag) {
            var Manager = AdTagManager.one(adTag.id).one('unlink').patch();
            Manager
                .then(function () {
                    adTag.libraryAdTag.visible = false;

                    AlertService.addAlert({
                        type: 'success',
                        message: $translate.instant('AD_TAG_MODULE.UNLINK_SUCCESS')
                    });
                })
                .catch(function () {
                    AlertService.addAlert({
                        type: 'error',
                        message: $translate.instant('AD_TAG_MODULE.UNLINK_FAIL')
                    });
                })
            ;
        };

        $scope.confirmDeletion = function (adTag) {
            var modalInstance = $modal.open({
                templateUrl: 'tagManagement/adTag/confirmDeletion.tpl.html'
            });

            modalInstance.result.then(function () {
                var Manager = !!adTag.libraryAdSlot ? AdSlotAdTagLibrariesManager : AdTagManager;

                return Manager.one(adTag.id).remove()
                    .then(
                    function () {
                        var index = adTags.indexOf(adTag);

                        if (index > -1) {
                            adTags.splice(index, 1);
                        }

                        $scope.adTags = adTags;

                        AlertService.replaceAlerts({
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

        function shareAdTag(adTag) {
            var libraryAdTag = {
                visible: true
            };

            AdTagLibrariesManager.one(adTag.libraryAdTag.id).patch(libraryAdTag)
                .then(function () {
                    adTag.libraryAdTag.visible = true;

                    AlertService.addAlert({
                        type: 'success',
                        message: $translate.instant('AD_TAG_MODULE.MOVED_TO_LIBRARY_SUCCESS')
                    });
                })
                .catch(function () {
                    AlertService.addAlert({
                        type: 'error',
                        message: $translate.instant('AD_TAG_MODULE.MOVED_TO_LIBRARY_FAIL')
                    });
                })
            ;
        }

        function backToListAdSlot() {
            if($stateParams.from == 'smart') {
                return historyStorage.getLocationPath(HISTORY_TYPE_PATH.ronAdSlot, '^.^.^.tagManagement.ronAdSlot.list');
            }

            if(!!$scope.adSlot.libType) {
                return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adSlotLibrary, '^.^.^.tagLibrary.adSlot.list');
            }

            var historyAdSlot = historyStorage.getParamsHistoryForAdSlot();

            //if($scope.isAdmin()) {
            //    if(!!historyAdSlot && !!historyAdSlot.siteId) {
            //        return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adSlot, '^.^.adSlot.list');
            //    }
            //}

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

            var item = {};
            item[field] = data;

            var Manager = !!adtag.libraryAdSlot ? AdSlotAdTagLibrariesManager : AdTagManager;
            Manager.one(adtag.id).patch(item)
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
    }
})();