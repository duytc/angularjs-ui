(function() {
    'use strict';

    angular.module('tagcade.videoLibrary.demandAdTag')
        .controller('LibraryDemandAdTagList', LibraryDemandAdTagList)
    ;

    function LibraryDemandAdTagList($scope, _, $translate, $modal, AlertService, demandAdTags, demandPartner, VideoAdTagManager, LibraryDemandAdTagManager, AtSortableService, HISTORY_TYPE_PATH, historyStorage) {
        $scope.demandAdTags = demandAdTags;
        $scope.demandPartner = demandPartner;

        $scope.hasData = function () {
            return !!demandAdTags.length;
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: $translate.instant('AD_SOURCE_MODULE.CURRENTLY_NO_AD_SOURCE')
            });
        }

        $scope.showPagination = showPagination;
        $scope.confirmDeletion = confirmDeletion;
        $scope.createLinkedDemandAdTag = createLinkedDemandAdTag;
        $scope.backToDemandPartnerList = backToDemandPartnerList;

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10
        };

        function createLinkedDemandAdTag(demandAdTag) {
            var waterfalls = VideoAdTagManager.one('notlinktolibrary').getList(null, {libraryVideoDemandAdTag: demandAdTag.id});

            waterfalls.then(function(waterfallTags) {
                $modal.open({
                    templateUrl: 'videoLibrary/demandAdTag/createLinkedDemandAdTag.tpl.html',
                    size: 'lg',
                    controller: 'CreateLinkedDemandAdTag',
                    resolve: {
                        demandAdTag: function () {
                            return demandAdTag;
                        },
                        videoPublishers: function (VideoPublisherManager) {
                            return VideoPublisherManager.getList()
                                .then(function(videoPublishers) {
                                    var videoPublisherForPublisher = [];

                                    angular.forEach(videoPublishers, function(videoPublisher) {
                                        if(videoPublisher.publisher.id == demandAdTag.videoDemandPartner.publisher.id) {
                                            videoPublisherForPublisher.push(videoPublisher);
                                        }
                                    });

                                    return videoPublisherForPublisher;
                                });
                        },
                        waterfallTags: function() {
                            var waterfallTagsForPublisher = [];

                            angular.forEach(waterfallTags, function(waterfallTag) {
                                if(waterfallTag.platform.length < demandAdTag.targeting.platform.length) {
                                    return
                                }

                                if(waterfallTag.videoPublisher.publisher.id == demandAdTag.videoDemandPartner.publisher.id) {
                                    if(demandAdTag.targeting.platform.length == 0 || _.intersection(waterfallTag.platform, demandAdTag.targeting.platform).length > 0) {
                                        waterfallTagsForPublisher.push(waterfallTag);
                                    }
                                }
                            });

                            return waterfallTagsForPublisher;
                        }
                    }
                });
            });
        }

        function confirmDeletion(demandAdTag , index) {
            var modalInstance = $modal.open({
                templateUrl: 'videoLibrary/demandAdTag/confirmDeletion.tpl.html'
            });

            modalInstance.result.then(function () {
                return LibraryDemandAdTagManager.one(demandAdTag.id).remove()
                    .then(
                    function () {
                        var index = demandAdTags.indexOf(demandAdTag);

                        if (index > -1) {
                            demandAdTags.splice(index, 1);
                        }

                        $scope.demandAdTags = demandAdTags;

                        if($scope.tableConfig.currentPage > 0 && demandAdTags.length/10 == $scope.tableConfig.currentPage) {
                            AtSortableService.insertParamForUrl({page: $scope.tableConfig.currentPage});
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

        function showPagination() {
            return angular.isArray($scope.demandAdTags) && $scope.demandAdTags.length > $scope.tableConfig.itemsPerPage;
        }

        function backToDemandPartnerList()
        {
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.demandPartner, '^.^.^.videoManagement.demandPartner.list');
        }

        $scope.$on('$locationChangeSuccess', function() {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.libraryDemandAdTag)
        });
    }
})();