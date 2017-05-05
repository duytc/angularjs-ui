(function() {
    'use strict';

    angular.module('tagcade.tagLibrary.adTag')
        .controller('LibraryAdTagList', LibraryAdTagList)
    ;

    function LibraryAdTagList($scope, $translate, $stateParams, EVENT_ACTION_SORTABLE ,$modal, adTags, AlertService, AdTagLibrariesManager, AdSlotManager, historyStorage, HISTORY_TYPE_PATH, TYPE_AD_SLOT, AtSortableService) {
        $scope.adTags = adTags.records;

        $scope.hasData = function () {
            return !!adTags.records.length;
        };

        var params = {
            page: 1
        };

        $scope.selectData = {
            query: $stateParams.searchKey || null
        };
        $scope.adSlotTypes = TYPE_AD_SLOT;

        $scope.tableConfig = {
            itemsPerPage: 10,
            totalItems: Number(adTags.totalRecord),
            maxPages: 10
        };

        if (!$scope.hasData()) {
            AlertService.addAlertNotRemove({
                type: 'warning',
                message: $translate.instant('AD_TAG_LIBRARY_MODULE.CURRENTLY_NO_AD_TAG')
            });
        }

        $scope.showPagination = showPagination;
        $scope.removeMoveToLibrary = removeMoveToLibrary;
        $scope.updateAdTag = updateAdTag;
        $scope.createLinkedAdAdTag = createLinkedAdAdTag;
        $scope.changePage = changePage;
        $scope.searchData = searchData;

        function showPagination() {
            return adTags.totalRecord >= $scope.tableConfig.itemsPerPage;
        }

        $scope.availableOptions = {
            currentPage: $stateParams.page || 1,
            pageSize: 10
        };

        function removeMoveToLibrary(adTag) {
            var modalInstance = $modal.open({
                templateUrl: 'tagManagement/adTag/confirmDeletion.tpl.html'
            });

            modalInstance.result.then(function () {
                return AdTagLibrariesManager.one(adTag.id).remove()
                    .then(function () {
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
                            message: $translate.instant('AD_TAG_LIBRARY_MODULE.REMOVE_SUCCESS')
                        });
                    })
                    .catch(function (status) {
                        var message;

                        if(!!status && !!status.data && !!status.data.message) {
                            message = status.data.message
                        }
                        else {
                            message = $translate.instant('AD_TAG_LIBRARY_MODULE.REMOVE_FAIL')
                        }

                        AlertService.replaceAlerts({
                            type: 'error',
                            message: message
                        });
                    })
                    ;
            })
        }

        function updateAdTag(data, field, adtag) {
            if(adtag[field] == data) {
                return;
            }

            var saveField = angular.copy(adtag[field]);
            adtag[field] = data;
            var item = angular.copy(adtag);
            delete item.associatedTagCount;

            AdTagLibrariesManager.one(item.id).patch(item)
                .then(function() {
                    AlertService.replaceAlerts({
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

        function createLinkedAdAdTag(adTag) {
            $modal.open({
                templateUrl: 'tagLibrary/adTag/createLinkedAdTags.tpl.html',
                size: 'lg',
                controller: 'CreateLinkedAdTags',
                resolve: {
                    adTag: function () {
                        return adTag;
                    }
                }
            });
        }

        $scope.$on('$locationChangeSuccess', function() {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.adTagLibrary)
        });


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
                return AdTagLibrariesManager.one().get(query)
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