(function() {
    'use strict';

    angular.module('tagcade.videoManagement.adTag')
        .controller('VideoAdTagList', VideoAdTagList)
    ;

    function VideoAdTagList($scope, $translate, $stateParams ,$modal, AlertService, adTags, videoPublisher, VideoAdTagManager, AtSortableService, VideoPublisherManager, HISTORY_TYPE_PATH, historyStorage, dateUtil, DIMENSIONS_OPTIONS_VIDEO_REPORT, EVENT_ACTION_SORTABLE) {
        $scope.adTags = adTags.records;
        $scope.videoPublisher = videoPublisher;

        $scope.hasData = function () {
            return !!$scope.adTags.length;
        };

        var params = {
            page: 1
        };

        $scope.selectData = {
            query: $stateParams.searchKey || null
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: $translate.instant('VIDEO_AD_TAG_MODULE.CURRENTLY_NO_VIDEO_AD_TAG')
            });
        }

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10,
            totalItems: Number(adTags.totalRecord)
        };

        $scope.availableOptions = {
            currentPage: $stateParams.page || 1,
            pageSize: 10
        };

        $scope.showPagination = showPagination;
        $scope.confirmDeletion = confirmDeletion;
        $scope.generateVast = generateVast;
        $scope.createDemandAdTag = createDemandAdTag;
        $scope.backToListVideoPublisher = backToListVideoPublisher;
        $scope.paramsReport = paramsReport;
        $scope.showVastTagVast = showVastTagVast;
        
        function showVastTagVast(videoWaterfallTag) {
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

        $scope.changePage = changePage;
        $scope.searchData = searchData;

        $scope.$on(EVENT_ACTION_SORTABLE, function(event, query) {
            params = angular.extend(params, query);
            _getAdTags(params);
        });

        function changePage(currentPage) {
            params = angular.extend(params, {page: currentPage});
            _getAdTags(params);
        }

        function searchData() {
            var query = {searchKey: $scope.selectData.query || ''};
            params = angular.extend(params, query);
            _getAdTags(params);
        }

        var getAdTag;
        function _getAdTags(query) {
            params = query;

            clearTimeout(getAdTag);

            getAdTag = setTimeout(function() {
                params = query;
                var getPage = !!videoPublisher ? VideoPublisherManager.one(videoPublisher.id).one('videowaterfalltags').get(query) : VideoAdTagManager.one().get(query);
                return getPage
                    .then(function(adTags) {
                        AtSortableService.insertParamForUrl(query);
                        $scope.adTags = adTags.records;
                        $scope.tableConfig.totalItems = Number(adTags.totalRecord);
                        $scope.availableOptions.currentPage = Number(query.page);
                    });
            }, 500);
        }

        function paramsReport(item) {
            var paramsReport = {
                filters: {
                    publisher: [],
                    demandPartner: [],
                    videoDemandAdTag: [],
                    videoPublisher: [],
                    waterfallTag: [item.id],
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

        function backToListVideoPublisher() {
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.videoPublisher, '^.^.videoPublisher.list');
        }

        function createDemandAdTag(videoWaterfallTag) {
            $modal.open({
                templateUrl: 'videoManagement/demandAdTag/demandAdTagFormQuickly.tpl.html',
                size: 'lg',
                resolve: {
                    videoDemandAdTag: function() {
                        return null;
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
                    videoWaterfallTagItems: function(VideoAdTagItemManager, $filter) {
                        return VideoAdTagItemManager.one('adtag').getList(videoWaterfallTag.id)
                            .then(function(videoAdTagItems) {
                                updatePositionForVideoAdTagItem(videoAdTagItems);

                                return $filter('orderBy')(videoAdTagItems, 'position')
                            });
                    },
                    publisher: function() {
                        return videoWaterfallTag.videoPublisher.publisher;
                    },
                    position: function() {
                        return null;
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
        }

        function updatePositionForVideoAdTagItem(videoWaterfallTagItems) {
            // update position for video adtag item
            var position = 0;
            angular.forEach(videoWaterfallTagItems, function(videoWaterfallTagItem) {
                videoWaterfallTagItem.position = position++
            });
        }

        function confirmDeletion(adTag, index) {
            var modalInstance = $modal.open({
                templateUrl: 'videoManagement/adTag/confirmDeletion.tpl.html'
            });

            modalInstance.result.then(function () {
                return VideoAdTagManager.one(adTag.id).remove()
                    .then(
                    function () {
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
                            message: $translate.instant('VIDEO_AD_TAG_MODULE.DELETE_SUCCESS')
                        });
                    },
                    function () {
                        AlertService.replaceAlerts({
                            type: 'danger',
                            message:  $translate.instant('VIDEO_AD_TAG_MODULE.DELETE_FAIL')
                        });
                    }
                )
                    ;
            });
        }

        function generateVast(adTag) {
            $modal.open({
                templateUrl: 'videoManagement/adTag/generateVast.tpl.html',
                resolve: {
                    vastTag: function () {
                        return VideoAdTagManager.one(adTag.id).customGET('vasttag', {secure: false});
                    }
                },
                controller: function ($scope, vastTag, VideoAdTagManager) {
                    $scope.selected = {
                        secure: false
                    };

                    $scope.adTag = adTag;
                    $scope.vastTag = vastTag;

                    $scope.getTextToCopy = function(string) {
                        return string.replace(/\n/g, '\r\n');
                    };

                    $scope.highlightText = function (vasttag) {
                        return vasttag.replace(new RegExp("[^&?]*?=", "gi"), function(match) {
                            return '<span class="highlightedText">' + match.replace('=', '') + '</span>=';
                        });
                    };

                    $scope.secureChange = function(secure) {
                        VideoAdTagManager.one(adTag.id).customGET('vasttag', {secure: secure})
                            .then(function(vastTag) {
                                $scope.vastTag = vastTag;
                            });
                    }
                }
            });
        }

        function showPagination() {
            return angular.isArray($scope.adTags) && $scope.tableConfig.totalItems > $scope.tableConfig.itemsPerPage;
        }

        $scope.$on('$locationChangeSuccess', function() {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.videoAdTag)
        });
    }
})();