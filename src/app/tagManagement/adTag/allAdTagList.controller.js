(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adTag')
        .controller('AllAdTagList', AllAdTagList)
    ;

    function AllAdTagList($scope, $stateParams, $translate, $modal, adTags, AdTagManager, AdSlotAdTagLibrariesManager, AdTagLibrariesManager, AlertService, AtSortableService, historyStorage, HISTORY_TYPE_PATH, EVENT_ACTION_SORTABLE) {
        $scope.adTags = adTags.records;

        $scope.hasAdTags = function () {
            return !!adTags.records.length;
        };

        var params = {
            page: 1
        };

        $scope.selectData = {
            query: $stateParams.searchKey || null
        };

        $scope.tableConfig = {
            itemsPerPage: 10,
            totalItems: Number(adTags.totalRecord),
            maxPages: 10
        };

        $scope.availableOptions = {
            currentPage: $stateParams.page || 1,
            pageSize: 10
        };

        if (!$scope.hasAdTags()) {
            AlertService.addAlertNotRemove({
                type: 'warning',
                message: $translate.instant('AD_TAG_MODULE.CURRENTLY_NO_AD_TAG')
            });
        }

        $scope.showPagination = showPagination;
        $scope.backToListAdSlot = backToListAdSlot;
        $scope.updateAdTag = updateAdTag;
        $scope.shareAdTag = shareAdTag;
        $scope.changePage = changePage;
        $scope.searchData = searchData;

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

        $scope.unLinkAdTag = function (adTag) {
            var Manager = AdTagManager.one(adTag.id).one('unlink').patch();
            Manager
                .then(function () {
                    adTag.libraryAdTag.visible = false;

                    AlertService.replaceAlerts({
                        type: 'success',
                        message: $translate.instant('AD_TAG_MODULE.UNLINK_SUCCESS')
                    });
                })
                .catch(function () {
                    AlertService.replaceAlerts({
                        type: 'error',
                        message: $translate.instant('AD_TAG_MODULE.UNLINK_FAIL')
                    });
                })
            ;
        };

        $scope.confirmDeletion = function (adTag) {
            var modalInstance = $modal.open({
                templateUrl: 'tagManagement/adTag/confirmDeletion.tpl.html'
            });

            modalInstance.result.then(function () {
                var Manager = !!adTag.libraryAdSlot ? AdSlotAdTagLibrariesManager : AdTagManager;

                return Manager.one(adTag.id).remove()
                    .then(
                    function () {
                        // Use _getAdTags() instead of directly AdTagManager.get() because of pagination.
                        // TODO: remove below block code...
                        //$stateParams.page = !$stateParams.page ? 1 : $stateParams.page;
                        //
                        //return AdTagManager.one().get($stateParams)
                        //    .then(function (adTags) {
                        //        $scope.adTags = adTags;
                        //
                        //        AlertService.replaceAlerts({
                        //            type: 'success',
                        //            message: $translate.instant('AD_TAG_MODULE.DELETE_SUCCESS')
                        //        });
                        //    });

                        AlertService.replaceAlerts({
                            type: 'success',
                            message: $translate.instant('AD_TAG_MODULE.DELETE_SUCCESS')
                        });

                        $stateParams.page = !$stateParams.page ? 1 : $stateParams.page;
                        _getAdTags($stateParams);
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

        function showPagination() {
            return angular.isArray(adTags.records) && $scope.tableConfig.totalItems > $scope.tableConfig.itemsPerPage;
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
                        message: $translate.instant('AD_TAG_MODULE.MOVED_TO_LIBRARY_SUCCESS')
                    });
                })
                .catch(function () {
                    AlertService.replaceAlerts({
                        type: 'error',
                        message: $translate.instant('AD_TAG_MODULE.MOVED_TO_LIBRARY_FAIL')
                    });
                })
            ;
        }

        function backToListAdSlot() {
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adSlot, '^.^.adSlot.listAll');
        }

        function updateAdTag(data, field, adtag) {
            adtag.libraryAdTag.adNetwork = adtag.libraryAdTag.adNetwork.id ? adtag.libraryAdTag.adNetwork.id : adtag.libraryAdTag.adNetwork;

            if(adtag[field] == data) {
                return;
            }

            var item = {};
            item[field] = data;

            var Manager = !!adtag.libraryAdSlot ? AdSlotAdTagLibrariesManager : AdTagManager;
            Manager.one(adtag.id).patch(item)
                .then(function() {
                    adtag[field] = data;

                    AlertService.replaceAlerts({
                        type: 'success',
                        message: $translate.instant('AD_TAG_MODULE.UPDATE_SUCCESS')
                    });
                })
                .catch(function() {
                    adtag[field] = adtag[field];

                    AlertService.replaceAlerts({
                        type: 'error',
                        message: $translate.instant('AD_TAG_MODULE.UPDATE_FAIL')
                    });
                });
        }

        function changePage(currentPage) {
            params = angular.extend(params, {page: currentPage});
            _getAdTags(params);
        }

        function searchData() {
            var query = {searchKey: $scope.selectData.query || ''};
            params = angular.extend(params, query);
            _getAdTags(params, 500);
        }

        $scope.$on(EVENT_ACTION_SORTABLE, function(event, query) {
            params = angular.extend(params, query);
            _getAdTags(params);
        });

        var getAdTag;
        function _getAdTags(query, ms) {
            params = query;

            clearTimeout(getAdTag);

            getAdTag = setTimeout(function() {
                params = query;
                return AdTagManager.one().get(query)
                    .then(function(adTags) {
                        AtSortableService.insertParamForUrl(query);
                        $scope.adTags = adTags.records;
                        $scope.tableConfig.totalItems = Number(adTags.totalRecord);
                        $scope.availableOptions.currentPage = Number(query.page);
                    });
            }, ms || 0);
        }
    }
})();