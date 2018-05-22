(function() {
    'use strict';

    angular.module('tagcade.videoManagement.demandAdTag')
        .controller('VideoDemandAdTagList', VideoDemandAdTagList)
    ;

    function VideoDemandAdTagList($scope, $filter, $q, _, $modal, $translate, videoWaterfallTagItems, videoWaterfallTag, VideoDemandAdTagManager, VideoAdTagItemManager, VideoAdTagManager, dataService, AlertService, dateUtil, historyStorage, HISTORY_TYPE_PATH, STRATEGY_OPTION, DIMENSIONS_OPTIONS_VIDEO_REPORT, API_BASE_URL) {
        $scope.videoWaterfallTagItems = videoWaterfallTagItems;
        updatePositionForVideoAdTagItem();

        $scope.strategyOption = STRATEGY_OPTION;

        var videoWaterfallTagItemsClone;
        $scope.enableDragDrop = false;

        $scope.hasDemandAdTags = function () {
            for(var index in $scope.videoWaterfallTagItems) {
                if(angular.isObject($scope.videoWaterfallTagItems[index]) && angular.isArray($scope.videoWaterfallTagItems[index].videoDemandAdTags) && $scope.videoWaterfallTagItems[index].videoDemandAdTags.length > 0) {
                    return true;
                }
            }

            return false;
        };

        if (!$scope.hasDemandAdTags()) {
            AlertService.addAlertNotRemove({
                type: 'warning',
                message: $translate.instant('AD_SOURCE_MODULE.CURRENTLY_NO_AD_SOURCE')
            });
        }

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

        $scope.videoWaterfallTagItemsGroup = _sortGroup($scope.videoWaterfallTagItems) || [];
        $scope.enableShowOptimizedPositions = false;

        $scope.actionDropdownToggled = actionDropdownToggled;
        $scope.enableDragDropAdTag = enableDragDropAdTag;
        $scope.backToListVideoTag = backToListVideoTag;
        $scope.createDemandAdTag = createDemandAdTag;
        $scope.updateDemandAdTag = updateDemandAdTag;
        $scope.selectStrategy = selectStrategy;
        $scope.confirmDeletionDemandAdTag = confirmDeletionDemandAdTag;
        $scope.toggleDemandAdTagStatus = toggleDemandAdTagStatus;
        $scope.splitFromGroup = splitFromGroup;
        $scope.paramsReport = paramsReport;
        $scope.showVastTagVast = showVastTagVast;
        $scope.isAutoOptimize = isAutoOptimize;
        $scope.showOptimizedPositions = showOptimizedPositions;

        function isAutoOptimize() {
            return videoWaterfallTag.autoOptimize &&
                $scope.hasAutoOptimizeModule;
        }

        function showOptimizedPositions() {
            $scope.enableDragDropAdTag(true);
            $scope.enableShowOptimizedPositions = !$scope.enableShowOptimizedPositions;

            if ($scope.enableShowOptimizedPositions) {
                // empty ad tags list
                $scope.videoWaterfallTagItems = [];

                dataService.makeHttpGetRequest('/videowaterfalltagitems/adtag/' + videoWaterfallTag.id + '/optimizedPositions', null, API_BASE_URL)
                .then(function (data) {
                    $scope.videoWaterfallTagItems = data || [];
                    $scope.videoWaterfallTagItemsGroup = _sortGroup($scope.videoWaterfallTagItems);
                });
            } else {
                // restore original ad tags
                $scope.videoWaterfallTagItems = videoWaterfallTagItems;

                // update the shown list
                $scope.videoWaterfallTagItemsGroup = _sortGroup($scope.videoWaterfallTagItems);
            }
        }

        //sort groups overlap position
        function _sortGroup(listAdTags) {
            var videoWaterfallTagItemsGroup = [];

            // current we do not support group for auto optimization
            // TODO: if API support tags same points are in same group, we need change here...
            if ($scope.enableShowOptimizedPositions) {
                _.each(listAdTags, function (adTag) {
                    if(!videoWaterfallTagItemsGroup[adTag.position]){
                        videoWaterfallTagItemsGroup[adTag.position] = [];
                    }
                    videoWaterfallTagItemsGroup[adTag.position].push(adTag);
                });

                return videoWaterfallTagItemsGroup;
            }

            _.each(listAdTags, function (item) {
                var index = 0;

                if (videoWaterfallTagItemsGroup.length == 0) {
                    videoWaterfallTagItemsGroup[index] = [];
                }
                else {
                    var found = false;
                    _.each(videoWaterfallTagItemsGroup, function (group, indexGroup) {
                        if (group[0].position == item.position && !found) {
                            found = true;
                            index = indexGroup;
                        }
                    });

                    if (found == false) {
                        index = videoWaterfallTagItemsGroup.length;
                        videoWaterfallTagItemsGroup[index] = [];
                    }
                }

                videoWaterfallTagItemsGroup[index].push(item);
            });

            return videoWaterfallTagItemsGroup;
        }

        function showVastTagVast() {
            $modal.open({
                templateUrl: 'videoManagement/adTag/showVastTag.tpl.html',
                size: 'lg',
                resolve: {
                    vastTags: function(VastTagRequestManager) {
                        return VastTagRequestManager.one().get({uuid: videoWaterfallTag.uuid})
                    },
                    videoWaterfallTag: function () {
                        return videoWaterfallTag
                    }
                },
                controller: 'ShowVastTag'
            });
        }

        function paramsReport(item) {
            var paramsReport = {
                filters: {
                    publisher: [],
                    demandPartner: [],
                    videoDemandAdTag: [item.id],
                    videoPublisher: [],
                    waterfallTag: [],
                    startDate: dateUtil.getFormattedDate(new Date()),
                    endDate: dateUtil.getFormattedDate(new Date())
                },
                metrics: [],
                breakdowns: ['day']
            };

            angular.forEach(DIMENSIONS_OPTIONS_VIDEO_REPORT, function (metric) {
                paramsReport.metrics.push(metric.key)
            });

            paramsReport.filters = angular.toJson(paramsReport.filters);
            paramsReport.metrics = angular.toJson(paramsReport.metrics);
            paramsReport.breakdowns = angular.toJson(paramsReport.breakdowns);

            return paramsReport;
        }

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

        function _start() {
            videoWaterfallTagItemsClone = angular.copy($scope.videoWaterfallTagItems);
        }

        function _stop() {
            var videoWaterfallTagJson = _formatVideoAdTagJson($scope.videoWaterfallTagItems);
            findWaterfallTagItems();

            VideoAdTagManager.one( videoWaterfallTag.id).one('positions').post(null, videoWaterfallTagJson)
                .then(function(videoWaterfallTagItemsResponse) {
                    $scope.videoWaterfallTagItems = $filter('orderBy')(videoWaterfallTagItemsResponse, 'position');
                    videoWaterfallTagItems = angular.copy($scope.videoWaterfallTagItems);
                    updatePositionForVideoAdTagItem();
                    actionDropdownToggled(false);

                    AlertService.replaceAlerts({
                        type: 'success',
                        message: $translate.instant('VIDEO_AD_TAG_MODULE.UPDATE_SUCCESS')
                    });
                })
                .catch(function() {
                    $scope.videoWaterfallTagItems = !!videoWaterfallTagItemsClone ? videoWaterfallTagItemsClone : $scope.videoWaterfallTagItems;

                    AlertService.replaceAlerts({
                        type: 'error',
                        message: $translate.instant('VIDEO_AD_TAG_MODULE.UPDATE_FAIL')
                    });
                });
        }

        function enableDragDropAdTag(enable) {
            $scope.enableDragDrop = !enable;

            $scope.sortableItemOption['disabled'] = enable;
            $scope.sortableGroupOptions['disabled'] = enable;
        }

        function backToListVideoTag() {
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.videoAdTag, '^.^.adTag.list');
        }

        function createDemandAdTag(videoWaterfallTagItems, position, videoDemandAdTag) {
            var modalInstance = $modal.open({
                templateUrl: 'videoManagement/demandAdTag/demandAdTagFormQuickly.tpl.html',
                size: 'lg',
                resolve: {
                    videoDemandAdTag: function() {
                        return videoDemandAdTag;
                    },
                    demandPartners: /* @ngInject */ function(VideoDemandPartnerManager) {
                        return VideoDemandPartnerManager.getList().then(function (demandPartners) {
                            return demandPartners.plain();
                        });
                    },
                    publishers: /* @ngInject */ function(adminUserManager, Auth) {
                        if(Auth.isAdmin()) {
                            return adminUserManager.getList({ filter: 'publisher' }).then(function (users) {
                                return users.plain();
                            });
                        }

                        return [];
                    },
                    videoWaterfallTagItems: function() {
                        return videoWaterfallTagItems;
                    },
                    publisher: function() {
                        return videoWaterfallTag.videoPublisher.publisher;
                    },
                    position: function() {
                        return position;
                    },
                    videoWaterfallTag: function() {
                        return videoWaterfallTag;
                    },
                    blackList: function(BlackListManager) {
                        return BlackListManager.getList()
                    },
                    whiteList: function(WhiteListManager) {
                        return WhiteListManager.getList()
                    }
                },
                controller: 'DemandAdTagFormQuickly'
            });

            modalInstance.result
                .then(function () {
                    // update position for video adtag item
                    updatePositionForVideoAdTagItem();
                    findWaterfallTagItems();
                })
        }

        function toggleDemandAdTagStatus(videoDemandAdTag, active) {
            var newTagStatus = active;

            VideoDemandAdTagManager.one(videoDemandAdTag.id).patch({'active': newTagStatus})
                .catch(function () {
                    AlertService.replaceAlerts({
                        type: 'error',
                        message: $translate.instant('AD_SOURCE_MODULE.CHANGE_STATUS_FAIL')
                    });

                    return $q.reject($translate.instant('AD_SOURCE_MODULE.CHANGE_STATUS_FAIL'));
                })
                .then(function () {
                    videoDemandAdTag.active = newTagStatus;

                    refreshVideoWaterFallListItems(videoDemandAdTag);
                })
            ;
        }

        function refreshVideoWaterFallListItems(newState) {
            if(!newState)
                return;

            // update status in initial ad tag list
            _.each(videoWaterfallTagItems, function (videoWaterfallTagItem) {
                _.each(videoWaterfallTagItem.videoDemandAdTags, function (t, index) {
                    if (t.id !== newState.id)
                        return;

                    if(t.active !== newState.active)
                        t.active = newState.active;

                    if(newState.isDeleted) {
                        videoWaterfallTagItem.videoDemandAdTags.splice(index, 1);
                        delete newState.isDeleted;
                    }

                });
            });
        }

        function splitFromGroup(videoDemandAdTags, videoDemandAdTag, videoWaterfallTagItems, positionVideoAdTagItem, indexVideoDemandAdTag) {
            var indexVideoAdTagItem = _.findIndex($scope.videoWaterfallTagItems, function(videoWaterfallTagItem) {
                return positionVideoAdTagItem == videoWaterfallTagItem.position
            });

            videoWaterfallTagItems.splice(indexVideoAdTagItem + 1, 0, {
                videoDemandAdTags: [videoDemandAdTag],
                strategy: 'linear',
                position: indexVideoAdTagItem + 1,
                videoWaterfallTagItem: null
            });

            // update position for video adtag item
            updatePositionForVideoAdTagItem();

            videoDemandAdTags.splice(indexVideoDemandAdTag, 1);

            return _stop();
        }

        function confirmDeletionDemandAdTag(videoDemandAdTag, videoDemandAdTags, positionVideoAdTagItem) {
            videoWaterfallTagItemsClone = angular.copy($scope.videoWaterfallTagItems);

            var modalInstance = $modal.open({
                templateUrl: 'videoManagement/demandAdTag/confirmDeletion.tpl.html'
            });

            modalInstance.result.then(function () {
                return VideoDemandAdTagManager.one(videoDemandAdTag.id).remove()
                    .then(
                    function () {
                        var index = videoDemandAdTags.indexOf(videoDemandAdTag);

                        if (index > -1) {
                            videoDemandAdTags.splice(index, 1);
                        }

                        if(videoDemandAdTags.length == 0) {
                            var indexVideoAdTagItem = _.findIndex($scope.videoWaterfallTagItems, function(videoWaterfallTagItem) {
                                return positionVideoAdTagItem == videoWaterfallTagItem.position
                            });

                            $scope.videoWaterfallTagItems.splice(indexVideoAdTagItem, 1);
                            updatePositionForVideoAdTagItem();

                            videoDemandAdTag.isDeleted = true;
                            refreshVideoWaterFallListItems(videoDemandAdTag);
                        }

                        AlertService.replaceAlerts({
                            type: 'success',
                            message: $translate.instant('AD_SOURCE_MODULE.DELETE_SUCCESS')
                        });
                    },
                    function () {
                        AlertService.replaceAlerts({
                            type: 'danger',
                            message:  $translate.instant('AD_SOURCE_MODULE.DELETE_FAIL')
                        });
                    }
                )
                    ;
            });
        }

        function selectStrategy(strategy, videoWaterfallTagItem) {
            var strategyClone = angular.copy(videoWaterfallTagItem.strategy);

            VideoAdTagItemManager.one(videoWaterfallTagItem.id).patch({strategy: strategy.key})
                .then(function() {
                    AlertService.replaceAlerts({
                        type: 'success',
                        message: $translate.instant('VIDEO_AD_TAG_MODULE.UPDATE_SUCCESS')
                    });
                })
                .catch(function() {
                    videoWaterfallTagItem.strategy = strategyClone;

                    AlertService.replaceAlerts({
                        type: 'error',
                        message: $translate.instant('VIDEO_AD_TAG_MODULE.UPDATE_FAIL')
                    });
            });
        }

        function updateDemandAdTag(data, field, videoDemandAdTag) {

            if(videoDemandAdTag[field] == data) {
                return;
            }

            var item = {};

            if ('timeout' == field) {
                item.libraryVideoDemandAdTag = {};
                item.libraryVideoDemandAdTag[field] = data
            } else {
                item[field] = data;
            }

            VideoDemandAdTagManager.one(videoDemandAdTag.id).patch(item)
                .then(function() {
                    if ('timeout' == field) {
                        videoDemandAdTag.libraryVideoDemandAdTag[field] = data;
                    } else {
                        videoDemandAdTag[field] = data;
                    }

                    AlertService.replaceAlerts({
                        type: 'success',
                        message: $translate.instant('AD_SOURCE_MODULE.UPDATE_SUCCESS')
                    });
                })
                .catch(function() {
                    videoDemandAdTag[field] = videoDemandAdTag[field];

                    AlertService.replaceAlerts({
                        type: 'error',
                        message: $translate.instant('AD_SOURCE_MODULE.UPDATE_FAIL')
                    });
                });
        }

        function updatePositionForVideoAdTagItem() {
            // update position for video adtag item
            var position = 0;
            angular.forEach($scope.videoWaterfallTagItems, function(videoWaterfallTagItem) {
                videoWaterfallTagItem.position = position++
            });
        }

        function _formatVideoAdTagJson(adTagItem) {
            var adTag = {
                videoWaterfallTagItems: []
            };

            var adTagItemClone = angular.copy(adTagItem);

            angular.forEach(adTagItemClone, function(item) {
                var videoDemandAdTags = [];

                angular.forEach(item.videoDemandAdTags, function(videoDemandAdTag) {
                    videoDemandAdTags.push(videoDemandAdTag.id);
                });

                adTag.videoWaterfallTagItems.push({
                    videoWaterfallTagItem: item.id || null,
                    videoDemandAdTags: videoDemandAdTags
                });
            });

            return adTag;
        }

        function findWaterfallTagItems() {
            $scope.videoWaterfallTagItems = $filter('filter')($scope.videoWaterfallTagItems, function(videoWaterfallTagItem) {
                if(videoWaterfallTagItem.videoDemandAdTags.length > 0) {
                    return true;
                }

                return false;
            });
        }
    }
})();