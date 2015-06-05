(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adTag')
        .controller('AdTagList', AdTagList)
    ;

    function AdTagList($scope, $q, $state, $modal, adTags, adSlot, AdTagManager, AlertService, historyStorage, HISTORY_TYPE_PATH) {
        $scope.hasAdTags = function () {
            return !!adTags.length;
        };

        if (!$scope.hasAdTags()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: 'There is currently no ad tags in this ad slot'
            });
        }

        var originalGroups;

        $scope.adSlot = adSlot;
        $scope.actionDropdownToggled = actionDropdownToggled;
        $scope.adTagsGroup = _sortGroup(adTags);
        $scope.updateAdTag = updateAdTag;
        $scope.enableDragDropAdTag = enableDragDropAdTag;
        $scope.backToListAdSlot = backToListAdSlot;

        $scope.sortableGroupOptions = {
            disabled: true,
            forcePlaceholderSize: true,
            placeholder: 'sortable-placeholder-group',
            stop: _stop,
            start: _start
        };

        $scope.sortableItemOption = {
            disabled: true,
            forcePlaceholderSize: true,
            placeholder: "sortable-placeholder-item",
            connectWith: ".itemAdTag",
            stop: _stop,
            start: _start
        };

        $scope.splitFromGroup = function(group, adTag) {
            angular.forEach(group, function(item, index) {
               if(item.id == adTag.id) {
                   group.splice(index, 1);
               }
            });

            originalGroups = angular.copy($scope.adTagsGroup);

            var adTagGroup = [];
            adTagGroup.push(adTag);
            $scope.adTagsGroup.splice(adTag.position, 0 , adTagGroup);

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
            if($scope.enableDragDrop) {
                $scope.sortableItemOption['disabled'] = isOpen;
                $scope.sortableGroupOptions['disabled'] = isOpen;
            }
        }

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

        function _start() {
            originalGroups = angular.copy($scope.adTagsGroup);

        }

        function getIdsWithRespectToGroup(adTagsGroup) {
            var groupIds = [];

            angular.forEach(adTagsGroup, function(group) {
                if(group.length > 0) {
                    groupIds.push(group.map(function (adTag) {
                            return adTag.id;
                        })
                    );
                }
            });

            return groupIds;
        }

        function groupIdentical(groupOld, groupNew) {
            var i = groupOld.length;
            if (i != groupNew.length) return false;
            var adTagsOld;
            var adTagsNew;
            while (i--) {
                adTagsOld = groupOld[i];
                adTagsNew = groupNew[i];

                if (!arraysIdentical(adTagsOld, adTagsNew)) return false;
            }

            return true;
        }

        function arraysIdentical(a, b) {
            var i = a.length;
            if (i != b.length) return false;
            while (i--) {
                if (a[i] !== b[i]) return false;
            }
            return true;
        }

        // handle event drag & drop
        function _stop() {
            var groupIds = getIdsWithRespectToGroup($scope.adTagsGroup);
            var originalGroupIds = getIdsWithRespectToGroup(originalGroups);

            if (groupIdentical(groupIds, originalGroupIds)) {
                return;
            }

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

        function enableDragDropAdTag(enable) {
            $scope.sortableItemOption['disabled'] = enable;
            $scope.sortableGroupOptions['disabled'] = enable;
        }

        function backToListAdSlot() {
            if($scope.isAdmin()) {
                return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adSlot, '^.^.adSlot.list', {siteId: adSlot.site.id});
            }

            var historyAdSlot = historyStorage.getParamsHistoryForAdSlot();
            if(!!historyAdSlot && !!historyAdSlot.siteId) {
                return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adSlot, '^.^.adSlot.list');
            }

            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adSlot, '^.^.adSlot.listAll');
        }
    }
})();