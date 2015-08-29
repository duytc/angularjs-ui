(function() {
    'use strict';

    angular.module('tagcade.tagManagement.channel')
        .controller('ChannelList', ChannelList)
    ;

    function ChannelList($scope, $modal, AlertService, channels, ChannelManager, AtSortableService, HISTORY_TYPE_PATH, historyStorage) {
        $scope.channels = channels;

        $scope.hasData = function () {
            return !!channels.length;
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: 'There is currently no channels'
            });
        }

        $scope.showPagination = showPagination;
        $scope.confirmDeletion = confirmDeletion;

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10
        };

        function confirmDeletion(channel, index) {
            var modalInstance = $modal.open({
                templateUrl: 'tagManagement/channel/confirmDeletion.tpl.html'
            });

            modalInstance.result.then(function () {
                return ChannelManager.one(channel.id).remove()
                    .then(
                    function () {
                        var index = channels.indexOf(channel);

                        if (index > -1) {
                            channels.splice(index, 1);
                        }

                        $scope.channels = channels;

                        if($scope.tableConfig.currentPage > 0 && channels.length/10 == $scope.tableConfig.currentPage) {
                            AtSortableService.insertParamForUrl({page: $scope.tableConfig.currentPage});
                        }

                        AlertService.replaceAlerts({
                            type: 'success',
                            message: 'The channel was deleted'
                        });
                    },
                    function () {
                        AlertService.replaceAlerts({
                            type: 'danger',
                            message: 'The channel could not be deleted'
                        });
                    }
                )
                    ;
            });
        }

        function showPagination() {
            return angular.isArray($scope.channels) && $scope.channels.length > $scope.tableConfig.itemsPerPage;
        }

        $scope.$on('$locationChangeSuccess', function() {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.channel)
        });
    }
})();