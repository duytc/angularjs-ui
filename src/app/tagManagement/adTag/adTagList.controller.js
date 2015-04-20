(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adTag')
        .controller('AdTagList', AdTagList)
    ;

    function AdTagList($scope, $state, $q, $modal, adTags, adSlot, AdTagManager, AlertService) {
        $scope.hasAdTags = function () {
            return !!adTags.length;
        };

        if (!$scope.hasAdTags()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: 'There is currently no ad tags in this ad slot'
            });
        }

        $scope.adSlot = adSlot;
        $scope.actionDropdownToggled = actionDropdownToggled;
        $scope.adTagsGroup = _sortGroup(adTags);
        $scope.adTags = adTags;
        $scope.updateAdTag = updateAdTag;

        $scope.sortableGroupOptions = {
            forcePlaceholderSize: true,
            placeholder: 'sortable-placeholder',
            stop: _stop
        };

        $scope.sortableItemOption = {
            forcePlaceholderSize: true,
            placeholder: "sortable-placeholder",
            connectWith: ".itemAdTag",
            stop: _stop
        };

        $scope.splitFromGroup = function(group, adTag) {
            angular.forEach(group, function(item, index) {
               if(item.id == adTag.id) {
                   group.splice(index, 1);
               }
            });

            var length = $scope.adTagsGroup.length;
            $scope.adTagsGroup[length] = [];
            $scope.adTagsGroup[length].push(adTag);

            return _stop();
        };

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

        // called when an action dropdown is opened/closed
        // we disable drag and drop sorting when it is open
        function actionDropdownToggled(isOpen) {
            $scope.sortableItemOption['disabled'] = isOpen;
            $scope.sortableGroupOptions['disabled'] = isOpen;
        }

        $scope.confirmDeletion = function (adTag, index) {
            var modalInstance = $modal.open({
                templateUrl: 'tagManagement/adTag/confirmDeletion.tpl.html'
            });

            modalInstance.result.then(function () {
                return AdTagManager.one(adTag.id).remove()
                    .then(
                        function () {
                            $scope.adTags.splice(index, 1);

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

        // handle event drag & drop
        function _stop() {
            var groupIds = [];

            angular.forEach($scope.adTagsGroup, function(group) {
                if(group.length > 0) {
                    groupIds.push(group.map(function (adTag) {
                            return adTag.id;
                        })
                    );
                }
            });

            adSlot.all('adtags').customPOST({ ids: groupIds }, 'positions')
                .catch(function () {
                    AlertService.replaceAlerts({
                        type: 'error',
                        message: 'The ad tags could not be reordered'
                    });

                    return $q.reject('could not reorder ad tags');
                })
                .then(function (adTags) {
                    actionDropdownToggled(false);
                    $scope.adTagsGroup = _sortGroup(adTags.plain());

                    AlertService.replaceAlerts({
                        type: 'success',
                        message: 'The ad tags have been reordered'
                    });
                })
            ;
        }

        //sort groups overlap position
        function _sortGroup(listAdTags) {
            var adTagsGroup = [];

            angular.forEach(listAdTags, function(item) {
                var index = 0;

                if(adTagsGroup.length == 0) {
                    adTagsGroup[index] = [];
                }
                else {
                    var found = false;
                    angular.forEach(adTagsGroup, function(group, indexGroup) {
                        if(group[0].position == item.position && !found) {
                            found = true;
                            index = indexGroup;
                        }
                    });

                    if(found == false) {
                        index = adTagsGroup.length;
                        adTagsGroup[index] = [];
                    }
                }

                adTagsGroup[index].push(item);
            });

            return adTagsGroup;
        }

        function updateAdTag(data, field, adtag) {
            if(adtag[field] == data) {
                return;
            }

            var saveField = angular.copy(adtag[field]);
            adtag[field] = data;
            var item = angular.copy(adtag);

            AdTagManager.one(item.id).customPUT(item)
                .then(function() {
                    $state.reload();

                    AlertService.addFlash({
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
    }
})();