(function() {
    'use strict';

    angular.module('tagcade.videoManagement.demandAdTag')
        .controller('DemandAdTagList', DemandAdTagList)
    ;

    function DemandAdTagList($scope, $state, $stateParams, $translate, $modal, AlertService, demandAdTags, demandPartner, LibraryDemandAdTagManager ,VideoDemandAdTagManager, AtSortableService, HISTORY_TYPE_PATH, DIMENSIONS_OPTIONS_VIDEO_REPORT, dateUtil, historyStorage, ITEMS_PER_PAGE) {

        $scope.demandAdTags = demandAdTags.records;
        $scope.demandPartner = demandPartner;
        $scope.listByLibrary = $state.params.listByLibrary;

        var params = $stateParams;

        $scope.itemsPerPageList = ITEMS_PER_PAGE;
        $scope.changeItemsPerPage = changeItemsPerPage;
        $scope.changePage = changePage;

        function changePage(currentPage) {
            params = angular.extend(params, {page: currentPage});
            _getDemandAdTags(params);
        }

        function changeItemsPerPage()
        {
            var query = {limit: $scope.tableConfig.itemsPerPage || ''};
            params.page = 1;
            params = angular.extend(params, query);
            -_getDemandAdTags(query, 500);
        }

        $scope.hasData = function () {
            return !!$scope.demandAdTags.length;
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: $translate.instant('AD_SOURCE_MODULE.CURRENTLY_NO_AD_SOURCE')
            });
        }

        $scope.showPagination = showPagination;
        $scope.confirmDeletion = confirmDeletion;
        $scope.toggleDemandAdTagStatus = toggleDemandAdTagStatus;
        $scope.backToListLibraryDemandAdTag = backToListLibraryDemandAdTag;
        $scope.paramsReport = paramsReport;

        $scope.availableOptions = {
            currentPage: $stateParams.page || 1,
            pageSize: 10
        };

        var libraryDemandAdTags;
        function _getDemandAdTags(query, ms) {
            params = query;

            clearTimeout(libraryDemandAdTags);

            libraryDemandAdTags = setTimeout(function() {
                params = query;
                //var getPage = !!demandPartner ? VideoDemandPartnerManager.one(demandPartner.id).one('videodemandadtags').get(query) : LibraryDemandAdTagManager.one().get(query);
                var getPage = LibraryDemandAdTagManager.one($stateParams.id).one('videodemandadtags').get($stateParams);
                return getPage
                    .then(function(demandAdTags) {
                        AtSortableService.insertParamForUrl(query);
                        $scope.demandAdTags = demandAdTags.records;
                        $scope.tableConfig.totalItems = Number(demandAdTags.totalRecord);
                        $scope.availableOptions.currentPage = Number(query.page);
                    });
            }, ms || 0);
        }

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 50,
            totalItems: Number(demandAdTags.totalRecord)

        };



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

        function backToListLibraryDemandAdTag() {
            if(!!demandPartner) {
                return historyStorage.getLocationPath(HISTORY_TYPE_PATH.libraryDemandAdTag, '^.^.^.videoLibrary.demandAdTag.listByDemandPartner');
            }

            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.libraryDemandAdTag, '^.^.^.videoLibrary.demandAdTag.list');
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
                })
            ;
        }

        function confirmDeletion(demandAdTag , index) {
            var modalInstance = $modal.open({
                templateUrl: 'videoManagement/demandAdTag/confirmDeletion.tpl.html'
            });

            modalInstance.result.then(function () {
                return VideoDemandAdTagManager.one(demandAdTag.id).remove()
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
                );
            });
        }

        function showPagination() {
            return angular.isArray($scope.demandAdTags) && demandAdTags.totalRecord > $scope.tableConfig.itemsPerPage;

        }

        $scope.$on('$locationChangeSuccess', function() {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.videoDemandAdTag)
        });
    }
})();