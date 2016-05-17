(function() {
    'use strict';

    angular.module('tagcade.tagManagement.channel')
        .controller('ChannelList', ChannelList)
    ;

    function ChannelList($scope, $translate, $modal, AlertService, channels, ChannelManager, AtSortableService, HISTORY_TYPE_PATH, RTB_STATUS_LABELS, historyStorage) {
        $scope.channels = channels;

        $scope.hasData = function () {
            return !!channels.length;
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: $translate.instant('CHANNEL_MODULE.CURRENTLY_NO_CHANNELS')
            });
        }

        $scope.rtbStatusLabels = RTB_STATUS_LABELS;
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
            return angular.isArray($scope.channels) && $scope.channels.length > $scope.tableConfig.itemsPerPage;
        }

        $scope.$on('$locationChangeSuccess', function() {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.channel)
        });
    }
})();