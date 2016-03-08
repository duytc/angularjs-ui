(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adTag')
        .controller('AdTagList', AdTagList)
    ;

    function AdTagList($scope, $translate, $q, $state, $modal, adTags, adSlot, AdTagManager, AdSlotAdTagLibrariesManager, AlertService, historyStorage, HISTORY_TYPE_PATH, AD_TYPES, TYPE_AD_SLOT) {
        $scope.adTags = adTags;

        $scope.hasAdTags = function () {
            return !!adTags.length;
        };

        if (!$scope.hasAdTags()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: $translate.instant('AD_TAG_MODULE.CURRENTLY_NO_AD_TAG')
            });
        }

        var originalGroups;
        $scope.enableDragDrop = false;

        $scope.adSlotTypes = TYPE_AD_SLOT;
        $scope.adTypes = AD_TYPES;
        $scope.adSlot = adSlot;
        $scope.actionDropdownToggled = actionDropdownToggled;
        $scope.adTagsGroup = _sortGroup($scope.adTags);
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

        // called when an action dropdown is opened/closed
        // we disable drag and drop sorting when it is open
        function actionDropdownToggled(isOpen) {
            if($scope.enableDragDrop) {
                $scope.sortableItemOption['disabled'] = isOpen;
                $scope.sortableGroupOptions['disabled'] = isOpen;

                setTimeout(function() {
                    $scope.$apply()
                }, 0)
            }
        }

        $scope.confirmDeletion = function (adTag) {
            var modalInstance = $modal.open({
                templateUrl: 'tagManagement/adTag/confirmDeletion.tpl.html'
            });

            modalInstance.result.then(function () {
                var Manager = !!adTag.libraryAdSlot ? AdSlotAdTagLibrariesManager : AdTagManager;

                return Manager.one(adTag.id).remove()
                    .then(function () {
                        var state = !!adTag.libraryAdSlot ? '^.displayList' : '^.list';
                        $state.go(state, {uniqueRequestCacheBuster: Math.random(), adSlotId: $scope.adSlot.id});

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
                        message: $translate.instant('AD_TAG_MODULE.REORDERED_AD_TAG_FAIL')
                    });

                    return $q.reject($translate.instant('AD_TAG_MODULE.REORDERED_AD_TAG_FAIL'));
                })
                .then(function (data) {
                    actionDropdownToggled(false);

                    $scope.adTags = data.plain();
                    adTags = $scope.adTags;
                    $scope.adTagsGroup = _sortGroup(adTags);

                    AlertService.replaceAlerts({
                        type: 'success',
                        message: $translate.instant('AD_TAG_MODULE.REORDERED_AD_TAG_SUCCESS')
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
            adtag.libraryAdTag.adNetwork = adtag.libraryAdTag.adNetwork.id ? adtag.libraryAdTag.adNetwork.id : adtag.libraryAdTag.adNetwork;

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

        function enableDragDropAdTag(enable) {
            $scope.enableDragDrop = !enable;

            $scope.sortableItemOption['disabled'] = enable;
            $scope.sortableGroupOptions['disabled'] = enable;
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
    }
})();