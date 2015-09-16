(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adTag')
        .controller('NativeAdTagList', NativeAdTagList)
    ;

    function NativeAdTagList($scope, $translate, $modal, adTags, AdTagManager, AdSlotAdTagLibrariesManager, AdTagLibrariesManager, AlertService, adSlot, historyStorage, HISTORY_TYPE_PATH, TYPE_AD_SLOT) {
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

            var Manager = !!adtag.libraryAdSlot ? AdSlotAdTagLibrariesManager : AdTagManager;
            Manager.one(item.id).patch(item)
                .then(function() {
                    AlertService.addAlert({
                        type: 'success',
                        message: $translate.instant('AD_TAG_MODULE.UPDATE_SUCCESS')
                    });
                })
                .catch(function() {
                    adtag[field] = saveField;

                    AlertService.replaceAlerts({
                        type: 'error',
                        message: $translate.instant('AD_TAG_MODULE.UPDATE_FAIL')
                    });
                });
        }

        function shareAdTag(adTag) {
            var libraryAdTag = {
                visible: true
            };

            AdTagLibrariesManager.one(adTag.libraryAdTag.id).patch(libraryAdTag)
                .then(function () {
                    adTag.libraryAdTag.visible = true;

                    AlertService.replaceAlerts({
                        type: 'success',
                        message: $translate.instant('AD_TAG_MODULE.MOVED_TO_LIBRARY_SUCCESS')
                    });
                })
                .catch(function () {
                    AlertService.replaceAlerts({
                        type: 'error',
                        message: $translate.instant('AD_TAG_MODULE.MOVED_TO_LIBRARY_FAIL')
                    });
                })
            ;
        }
    }
})();