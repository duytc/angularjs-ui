(function() {
    'use strict';

    angular.module('tagcade.tagLibrary.adTag')
        .controller('LibraryAdTagList', LibraryAdTagList)
    ;

    function LibraryAdTagList($scope, $modal, adTags, AlertService, AdTagLibrariesManager, historyStorage, HISTORY_TYPE_PATH, TYPE_AD_SLOT, AtSortableService) {
        $scope.adTags = adTags;

        $scope.hasData = function () {
            return !!adTags.length;
        };

        $scope.adSlotTypes = TYPE_AD_SLOT;

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: 'There is currently no ad tags in the library'
            });
        }

        $scope.showPagination = showPagination;
        $scope.removeMoveToLibrary = removeMoveToLibrary;
        $scope.updateAdTag = updateAdTag;

        function showPagination() {
            return angular.isArray($scope.adTags) && $scope.adTags.length > $scope.tableConfig.itemsPerPage;
        }

        function removeMoveToLibrary(adTag) {
            var modalInstance = $modal.open({
                templateUrl: 'tagManagement/adTag/confirmDeletion.tpl.html'
            });

            modalInstance.result.then(function () {
                return AdTagLibrariesManager.one(adTag.id).remove()
                    .then(function () {
                        var index = adTags.indexOf(adTag);

                        if (index > -1) {
                            adTags.splice(index, 1);
                        }

                        $scope.adTags = adTags;

                        if($scope.tableConfig.currentPage > 0 && adTags.length/10 == $scope.tableConfig.currentPage) {
                            AtSortableService.insertParamForUrl({page: $scope.tableConfig.currentPage});
                        }

                        AlertService.replaceAlerts({
                            type: 'success',
                            message: 'Remove ad tag from library successfully'
                        });
                    })
                    .catch(function (status) {
                        var message;

                        if(!!status && !!status.data && !!status.data.message) {
                            message = status.data.message
                        }
                        else {
                            message = 'Could not remove ad tag from library';
                        }

                        AlertService.replaceAlerts({
                            type: 'error',
                            message: message
                        });
                    })
                    ;
            })
        }

        function updateAdTag(data, field, adtag) {
            if(adtag[field] == data) {
                return;
            }

            var saveField = angular.copy(adtag[field]);
            adtag[field] = data;
            var item = angular.copy(adtag);

            AdTagLibrariesManager.one(item.id).patch(item)
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

        $scope.$on('$locationChangeSuccess', function() {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.adTagLibrary)
        });
    }
})();