(function() {
    'use strict';

    angular.module('tagcade.tagManagement.site')
        .controller('SiteChannelList', SiteChannelList)
    ;

    function SiteChannelList($scope, $filter, $modal, AlertService, channels, site, ChannelManager, SiteManager, historyStorage, HISTORY_TYPE_PATH) {
        $scope.channels = channels;
        $scope.site = site;

        $scope.hasData = function () {
            return !!channels.length;
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: 'There is currently no channels in this site'
            });
        }

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10
        };

        $scope.showPagination = showPagination;
        $scope.confirmDeletion = confirmDeletion;
        $scope.removeChannelFromSite = removeChannelFromSite;
        $scope.addChannelForChannel = addChannelForChannel;
        $scope.backToListSite = backToListSite;

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
                            $scope.tableConfig.currentPage =- 1;
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

        function removeChannelFromSite(channel, index) {
            var modalInstance = $modal.open({
                templateUrl: 'tagManagement/site/confirmChannelDeletion.tpl.html'
            });

            modalInstance.result.then(function () {
                return SiteManager.one(site.id).one('channel', channel.id).remove()
                    .then(
                    function () {
                        var index = channels.indexOf(channel);

                        if (index > -1) {
                            channels.splice(index, 1);
                        }

                        $scope.channels = channels;

                        if($scope.tableConfig.currentPage > 0 && channels.length/10 == $scope.tableConfig.currentPage) {
                            $scope.tableConfig.currentPage =- 1;
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
            return angular.isArray($scope.sites) && $scope.sites.length > $scope.tableConfig.itemsPerPage;
        }

        function addChannelForChannel() {
            $modal.open({
                templateUrl: 'tagManagement/site/addChannelsForSite.tpl.html',
                size: 'lg',
                controller: 'AddChannelsForSite',
                resolve: {
                    site: function () {
                        return site;
                    },
                    channels: function() {
                        return ChannelManager.getList()
                            .then(function(channels) {
                                return $filter('selectedPublisher')(channels.plain(), site.publisher);
                            });
                    },
                    channelsSite : function() {
                        return $scope.channels
                    }
                }
            });
        }

        function backToListSite() {
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.site, '^.list');
        }
    }
})();