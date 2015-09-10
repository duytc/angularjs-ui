(function() {
    'use strict';

    angular.module('tagcade.tagLibrary.adTag')
        .controller('ViewAssociateAdTags', ViewAssociateAdTags)
    ;

    function ViewAssociateAdTags($scope, $modal, adTags, TYPE_AD_SLOT, AlertService, AdTagManager, historyStorage, HISTORY_TYPE_PATH) {
       $scope.adTags = adTags;

        $scope.hasData = function () {
            return !!adTags.length;
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: 'There is currently no ad tags associated'
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

        function backToListAdTagLibrary() {
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adTagLibrary, '^.list');
        }

        $scope.toggleAdTagStatus = function (adTag) {
            var newTagStatus = !adTag.active;

            AdTagManager.one(adTag.id).patch({'active': newTagStatus})
                .catch(function () {
                    AlertService.replaceAlerts({
                        type: 'error',
                        message: 'Could not change ad tag status'
                    });

                    return $q.reject('could not update ad tag status');
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
                );
            });
        };
    }
})();