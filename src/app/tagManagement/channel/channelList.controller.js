(function () {
    'use strict';

    angular.module('tagcade.tagManagement.channel')
        .controller('ChannelList', ChannelList)
    ;

    function ChannelList($scope, $translate, $stateParams, $modal, AlertService, channels, ChannelManager, AtSortableService, HISTORY_TYPE_PATH, historyStorage, EVENT_ACTION_SORTABLE, ITEMS_PER_PAGE) {
        $scope.channels = channels.records;
        $scope.itemsPerPageList = ITEMS_PER_PAGE;

        $scope.changeItemsPerPage = changeItemsPerPage;
        $scope.changePage = changePage;
        $scope.searchData = searchData;


        var getChannel;
        var params = $stateParams;
        $scope.hasData = function () {
            return !!$scope.channels.length;
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: $translate.instant('CHANNEL_MODULE.CURRENTLY_NO_CHANNELS')
            });
        }

        $scope.showPagination = showPagination;
        $scope.confirmDeletion = confirmDeletion;

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10,
            totalItems: Number(channels.totalRecord)
        };

        $scope.availableOptions = {
            currentPage: $stateParams.page || 1,
            pageSize: 10
        };

        function confirmDeletion(channel, index) {
            var modalInstance = $modal.open({
                templateUrl: 'tagManagement/channel/confirmDeletion.tpl.html'
            });

            modalInstance.result.then(function () {
                return ChannelManager.one(channel.id).remove()
                    .then(
                        function () {
                            changePage(params.page);

                        AlertService.replaceAlerts({
                            type: 'success',
                            message: $translate.instant('CHANNEL_MODULE.DELETE_SUCCESS')
                        });
                    },
                    function () {
                        AlertService.replaceAlerts({
                            type: 'danger',
                            message:  $translate.instant('CHANNEL_MODULE.DELETE_FAIL')
                        });
                    }
                )
                    ;
            });
        }

        function showPagination() {
            return angular.isArray($scope.channels) && channels.totalRecord > $scope.tableConfig.itemsPerPage;
        }

        function searchData() {
            var query = {searchKey: $scope.selectData.query || ''};
            params = angular.extend(params, query);
            _getChannel(params, 500);
        }

        function changePage(currentPage) {
            params = angular.extend(params, {page: currentPage});
            _getChannel(params);
        }

        function _getChannel(query, ms) {
            clearTimeout(getChannel);

            getChannel = setTimeout(function () {
                params = query;
                return ChannelManager.one().get(query)
                    .then(function (channels) {
                        AtSortableService.insertParamForUrl(query);
                        $scope.channels = channels.records;
                        $scope.tableConfig.totalItems = Number(channels.totalRecord);
                        $scope.availableOptions.currentPage = Number(query.page);
                    });
            }, ms || 0);
        }


        function changeItemsPerPage() {
            var query = {limit: $scope.tableConfig.itemsPerPage || ''};
            params.page = 1;
            params = angular.extend(params, query);
            _getChannel(params, 500);
        }

        $scope.$on('$locationChangeSuccess', function () {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.channel)
        });

        $scope.$on(EVENT_ACTION_SORTABLE, function(event, query) {
            params = angular.extend(params, query);
            _getChannel(params);
        });

    }
})();