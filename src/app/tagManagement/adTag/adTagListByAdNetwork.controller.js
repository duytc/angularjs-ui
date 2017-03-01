(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adTag')
        .controller('AdTagListByAdNetwork', AdTagListByAdNetwork)
    ;

    function AdTagListByAdNetwork($scope, $translate, $stateParams, $state, $modal, adTags, adNetwork, AdTagManager, AlertService, AdTagLibrariesManager, AtSortableService, AdNetworkManager, historyStorage, HISTORY_TYPE_PATH, EVENT_ACTION_SORTABLE) {
        $scope.adNetwork = adNetwork;
        $scope.adTags = adTags;

        $scope.hasAdTags = function () {
            return !!adTags.totalRecord;
        };

        $scope.showPagination = showPagination;
        $scope.backToListAdNetwork = backToListAdNetwork;
        $scope.updateAdTag = updateAdTag;
        $scope.shareAdTag = shareAdTag;
        $scope.changePage = changePage;
        $scope.searchData = searchData;

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10,
            totalItems: Number(adTags.totalRecord)
        };

        $scope.availableOptions = {
            currentPage: $stateParams.page || 1,
            pageSize: 10
        };

        $scope.selectData = {
            query: $stateParams.searchKey || null
        };

        var params = {
            page: 1
        };

        var getAdTag;

        if (!$scope.hasAdTags()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: $translate.instant('AD_TAG_MODULE.CURRENTLY_NO_AD_TAG')
            });
        }

        $scope.toggleAdTagStatus = function (adTag) {
            var newTagStatus = !adTag.active;

            AdTagManager.one(adTag.id).patch({
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

                    angular.forEach(adTags, function(adTagChange) {
                        if(adTagChange.libraryAdTag.id == adTag.libraryAdTag.id && adTagChange.adSlot.libraryAdSlot.id == adTag.adSlot.libraryAdSlot.id && adTagChange.adSlot.site.id != adTag.adSlot.site.id) {
                            adTagChange.active = newTagStatus;
                        }
                    });
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
                return AdTagManager.one(adTag.id).remove()
                    .then(
                    function () {
                        historyStorage.getLocationPath(HISTORY_TYPE_PATH.adTagAdNetwork, $state.current);

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

        function showPagination() {
            return angular.isArray($scope.adTags.records) && $scope.adTags.totalRecord > $scope.tableConfig.itemsPerPage;
        }

        function backToListAdNetwork() {
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adNetwork, '^.^.adNetwork.list');
        }

        function updateAdTag(data, field, adtag) {
            if(adtag[field] == data) {
                return;
            }

            var item = {};
            item[field] = data;

            AdTagManager.one(adtag.id).patch(item)
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

        function changePage(currentPage) {
            params = angular.extend(params, {page: currentPage});
            _getAdTag(params);
        }

        function searchData() {
            var query = {searchKey: $scope.selectData.query || ''};
            params = angular.extend(params, query);
            _getAdTag(params);
        }

        $scope.$on(EVENT_ACTION_SORTABLE, function(event, query) {
            params = angular.extend(params, query);
            _getAdTag(params);
        });

        function _getAdTag(query) {
            params = query;

            clearTimeout(getAdTag);

            getAdTag = setTimeout(function() {
                var Manager = AdNetworkManager.one(adNetwork.id).one('adtags').get(query);

                params = query;
                return Manager
                    .then(function(adTags) {
                        AtSortableService.insertParamForUrl(query);
                        $scope.adTags = adTags;
                        $scope.tableConfig.totalItems = Number(adTags.totalRecord);
                        $scope.availableOptions.currentPage = Number(query.page);
                    });
            }, 500);
        }

        $scope.$on('$locationChangeSuccess', function() {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.adTagAdNetwork)
        });
    }
})();