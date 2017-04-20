(function() {
    'use strict';

    angular.module('tagcade.tagLibrary.adTag')
        .controller('ViewAssociateAdTags', ViewAssociateAdTags)
    ;

    function ViewAssociateAdTags($scope, $translate, $modal, adTags, TYPE_AD_SLOT, AlertService, AdTagManager, historyStorage, HISTORY_TYPE_PATH) {
       $scope.adTags = adTags;

        $scope.hasData = function () {
            return !!adTags.length;
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: $translate.instant('AD_TAG_LIBRARY_MODULE.CURRENTLY_NO_AD_TAG_ASSOCIATED')
            });
        }

        $scope.adSlotTypes = TYPE_AD_SLOT;
        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10
        };

        $scope.showPagination = showPagination;
        $scope.updateAdTag = updateAdTag;
        $scope.backToListAdTagLibrary = backToListAdTagLibrary;

        function showPagination() {
            return angular.isArray($scope.adTags) && $scope.adTags.length > $scope.tableConfig.itemsPerPage;
        }

        function updateAdTag(data, field, adtag) {
            adtag.libraryAdTag.adNetwork = adtag.libraryAdTag.adNetwork.id ? adtag.libraryAdTag.adNetwork.id : adtag.libraryAdTag.adNetwork;

            if(adtag[field] == data) {
                return;
            }

            var item = {};
            item[field] = data;

            AdTagManager.one(adtag.id).patch(item)
                .then(function() {
                    adtag[field] = data;

                    AlertService.replaceAlerts({
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

        function backToListAdTagLibrary() {
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adTagLibrary, '^.list');
        }

        $scope.toggleAdTagStatus = function (adTag) {
            var newTagStatus = !adTag.active;

            AdTagManager.one(adTag.id).patch({'active': newTagStatus})
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
                        var index = adTags.indexOf(adTag);

                        if (index > -1) {
                            adTags.splice(index, 1);
                        }

                        $scope.adTags = adTags;

                        if($scope.tableConfig.currentPage > 0 && adTags.length/10 == $scope.tableConfig.currentPage) {
                            $scope.tableConfig.currentPage =- 1;
                        }

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
                );
            });
        };
    }
})();