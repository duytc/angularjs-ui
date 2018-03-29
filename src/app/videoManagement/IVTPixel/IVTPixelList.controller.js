(function() {
    'use strict';

    angular.module('tagcade.videoManagement.IVTPixel')
        .controller('IVTPixelList', IVTPixelList)
    ;

    function IVTPixelList($scope, $stateParams ,$translate, $modal, AlertService, IVTPixels, VideoIVTPixelManager, AtSortableService, HISTORY_TYPE_PATH, historyStorage, EVENT_ACTION_SORTABLE, ITEMS_PER_PAGE) {

        $scope.itemsPerPageList = ITEMS_PER_PAGE;
        $scope.IVTPixels = IVTPixels.records;

        $scope.hasData = function () {
            return !!$scope.IVTPixels.length;
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: 'There is currently no IVT Pixels'
            });
        }

        var params = {
            page: 1
        };

        $scope.selectData = {
            query: $stateParams.searchKey || null
        };

        $scope.showPagination = showPagination;
        $scope.confirmDeletion = confirmDeletion;
        $scope.changeItemsPerPage = changeItemsPerPage;

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10,
            totalItems: Number(IVTPixels.totalRecord)
        };

        $scope.availableOptions = {
            currentPage: $stateParams.page || 1,
            pageSize: 10
        };

        $scope.changePage = changePage;
        $scope.searchData = searchData;

        $scope.$on(EVENT_ACTION_SORTABLE, function(event, query) {
            params = angular.extend(params, query);
            _getIVTPixels(params);
        });

        function changePage(currentPage) {
            params = angular.extend(params, {page: currentPage});
            _getIVTPixels(params);
        }

        function searchData() {
            var query = {searchKey: $scope.selectData.query || ''};
            params = angular.extend(params, query);
            _getIVTPixels(params, 500);
        }

        var getIVTPixels;
        function _getIVTPixels(query, ms) {
            params = query;

            clearTimeout(getIVTPixels);

            getIVTPixels = setTimeout(function() {
                params = query;
                return VideoIVTPixelManager.one().get(query)
                    .then(function(IVTPixels) {
                        AtSortableService.insertParamForUrl(query);
                        $scope.IVTPixels = IVTPixels.records;
                        $scope.tableConfig.totalItems = Number(IVTPixels.totalRecord);
                        $scope.availableOptions.currentPage = Number(query.page);
                    });
            }, ms || 0);
        }

        function confirmDeletion(IVTPixel, index) {
            var modalInstance = $modal.open({
                templateUrl: 'videoManagement/IVTPixel/confirmDeletion.tpl.html'
            });

            modalInstance.result.then(function () {
                return VideoIVTPixelManager.one(IVTPixel.id).remove()
                    .then(
                    function () {
                        _getIVTPixels(params);

                        AlertService.replaceAlerts({
                            type: 'success',
                            message: 'The IVT Pixel was deleted'
                        });
                    },
                    function () {
                        AlertService.replaceAlerts({
                            type: 'danger',
                            message:  'The IVT Pixel could not be deleted'
                        });
                    }
                )
                    ;
            });
        }

        function showPagination() {
            return angular.isArray($scope.IVTPixels) && $scope.tableConfig.totalItems > $scope.tableConfig.itemsPerPage;
        }

        $scope.$on('$locationChangeSuccess', function() {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.IVTPixel)
        });

        function changeItemsPerPage()
        {
            var query = {limit: $scope.tableConfig.itemsPerPage || ''};
            params.page = 1;
            params = angular.extend(params, query);
            _getIVTPixels(params, 500);
        }
    }
})();