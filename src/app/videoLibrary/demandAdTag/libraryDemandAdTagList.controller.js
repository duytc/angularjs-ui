(function() {
    'use strict';

    angular.module('tagcade.videoLibrary.demandAdTag')
        .controller('LibraryDemandAdTagList', LibraryDemandAdTagList)
    ;

    function LibraryDemandAdTagList($scope, _, $stateParams ,$translate, $modal, AlertService, demandAdTags, demandPartner, VideoAdTagManager, LibraryDemandAdTagManager, VideoDemandPartnerManager, AtSortableService, HISTORY_TYPE_PATH, EVENT_ACTION_SORTABLE, ITEMS_PER_PAGE ,historyStorage) {

        $scope.demandAdTags = demandAdTags.records;
        $scope.demandPartner = demandPartner;

        $scope.itemsPerPageList = ITEMS_PER_PAGE;
        $scope.changeItemsPerPage = changeItemsPerPage;

        var params = {
            page: 1
        };

        $scope.selectData = {
            query: $stateParams.searchKey || null
        };

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10,
            totalItems: Number(demandAdTags.totalRecord)
        };

        $scope.availableOptions = {
            currentPage: $stateParams.page || 1,
            pageSize: 10
        };

        $scope.changePage = changePage;
        $scope.searchData = searchData;
        $scope.changeItemsPerPage = changeItemsPerPage;

        $scope.$on(EVENT_ACTION_SORTABLE, function (event, query){
            params = angular.extend(params, query);
            _getDemandAdTags(params);
        });

        function changePage(currentPage) {
            params = angular.extend(params, {page: currentPage});
            _getDemandAdTags(params);
        }

        function searchData() {
            var query = {searchKey: $scope.selectData.query || ''};
            params = angular.extend(params, query);
            _getDemandAdTags(params, 500);
        }

        var libraryDemandAdTags;
        function _getDemandAdTags(query, ms) {
            params = query;

            clearTimeout(libraryDemandAdTags);

            libraryDemandAdTags = setTimeout(function() {
                params = query;
                var getPage = !!demandPartner ? VideoDemandPartnerManager.one(demandPartner.id).one('libraryvideodemandadtags').get(query) : LibraryDemandAdTagManager.one().get(query);
                return getPage
                    .then(function(demandAdTags) {
                        AtSortableService.insertParamForUrl(query);
                        $scope.demandAdTags = demandAdTags.records;
                        $scope.tableConfig.totalItems = Number(demandAdTags.totalRecord);
                        $scope.availableOptions.currentPage = Number(query.page);
                    });
            }, ms || 0);
        }

        $scope.hasData = function () {
            return demandAdTags.totalRecord;
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
                        _getDemandAdTags(params);

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
            return angular.isArray($scope.demandAdTags) && $scope.tableConfig.totalItems > $scope.tableConfig.itemsPerPage;
        }

        function backToDemandPartnerList()
        {
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.demandPartner, '^.^.^.videoManagement.demandPartner.list');
        }

        $scope.$on('$locationChangeSuccess', function() {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.libraryDemandAdTag)
        });

        function changeItemsPerPage()
        {
            var query = {limit: $scope.tableConfig.itemsPerPage || ''};
            params.page = 1;
            params = angular.extend(params, query);
            _getDemandAdTags(params, 500);
        }
    }
})();