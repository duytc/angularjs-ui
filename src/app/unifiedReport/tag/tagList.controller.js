(function() {
    'use strict';

    angular.module('tagcade.unifiedReport.tag')
        .controller('TagList', TagList);

    function TagList($scope, $modal, $stateParams, AlertService, tags, UnifiedReportTagManager, AtSortableService, historyStorage, HISTORY_TYPE_PATH, EVENT_ACTION_SORTABLE) {
        $scope.tags = tags;

        $scope.hasData = function () {
            return !!$scope.tags && $scope.tags.totalRecord > 0;
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: 'There is currently no user tag'
            });
        }

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10,
            totalItems: Number(tags.totalRecord)
        };

        $scope.availableOptions = {
            currentPage: $stateParams.page || 1,
            pageSize: 10
        };

        $scope.selectData = {
            query: $stateParams.searchKey || null
        };

        var params = $stateParams;
        var getTag;

        $scope.showPagination = showPagination;
        $scope.confirmDeletion = confirmDeletion;
        $scope.changePage = changePage;
        $scope.searchData = searchData;

        function confirmDeletion(tag, index) {
            var modalInstance = $modal.open({
                templateUrl: 'unifiedReport/tag/confirmDeletion.tpl.html'
            });

            modalInstance.result.then(function () {
                return UnifiedReportTagManager.one(tag.id).remove()
                    .then(function () {
                        _getTags(params);

                        AlertService.replaceAlerts({
                            type: 'success',
                            message: 'The user tag was deleted'
                        });
                    },   function () {
                        AlertService.replaceAlerts({
                            type: 'danger',
                            message: 'The user tag could not be deleted'
                        });
                    })
            })
        }

        function showPagination() {
            return angular.isArray($scope.tags.records) && $scope.tags.totalRecord > $scope.tableConfig.itemsPerPage;
        }

        $scope.$on(EVENT_ACTION_SORTABLE, function (event, query){
            params = angular.extend(params, query);
            _getTags(params);
        });

        function changePage(currentPage){
            params = angular.extend(params, {
                page: currentPage
            });
            _getTags(params);
        }

        function searchData(){
            var query = {searchKey: $scope.selectData.query || ''};
            params = angular.extend(params, query);
            _getTags(params, 500);
        }

        function _getTags(query, ms){
            clearTimeout(getTag);

            getTag = setTimeout(function (){
                return UnifiedReportTagManager.one().get(query)
                    .then(function (tags){
                        AtSortableService.insertParamForUrl(query);

                        setTimeout(function (){
                            $scope.tags = tags;
                            $scope.tableConfig.totalItems = Number(tags.totalRecord);
                            $scope.availableOptions.currentPage = Number(query.page);
                        }, 0)
                    });
            }, ms || 0)

        }

        $scope.$on('$locationChangeSuccess', function() {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.tag)
        });
    }
})();