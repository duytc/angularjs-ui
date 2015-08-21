(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adTag')
        .controller('AdTagListByAdNetwork', AdTagListByAdNetwork)
    ;

    function AdTagListByAdNetwork($scope, $modal, adTags, adNetwork, AdTagManager, AlertService, historyStorage, HISTORY_TYPE_PATH, AdTagLibrariesManager) {
        $scope.adNetwork = adNetwork;
        $scope.adTags = adTags;

        $scope.hasAdTags = function () {
            return !!adTags.length;
        };

        $scope.showPagination = showPagination;
        $scope.backToListAdNetwork = backToListAdNetwork;
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

                        AlertService.replaceAlerts({
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

        function backToListAdNetwork() {
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adNetwork, '^.^.adNetwork.list');
        }

        function updateAdTag(data, field, adtag) {
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
            var libraryAdTag = {
                visible: true
            };

            AdTagLibrariesManager.one(adTag.libraryAdTag.id).patch(libraryAdTag)
                .then(function () {
                    adTag.libraryAdTag.visible = true;

                    AlertService.replaceAlerts({
                        type: 'success',
                        message: 'The ad tag has not been moved to library'
                    });
                })
                .catch(function () {
                    AlertService.replaceAlerts({
                        type: 'error',
                        message: 'The ad tag has been moved to library'
                    });
                })
            ;
        }

        $scope.$on('$locationChangeSuccess', function() {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.adTag)
        });
    }
})();