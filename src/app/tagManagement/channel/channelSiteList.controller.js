(function() {
    'use strict';

    angular.module('tagcade.tagManagement.channel')
        .controller('ChannelSiteList', ChannelSiteList)
    ;

    function ChannelSiteList($scope, $translate, $filter, $modal, AlertService, channel, sites, ChannelManager, SiteManager, SiteCache, historyStorage, HISTORY_TYPE_PATH) {
        $scope.sites = sites;
        $scope.channel = channel;

        $scope.hasData = function () {
            return !!sites.length;
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: $translate.instant('CHANNEL_MODULE.CURRENTLY_NO_SITES_CHANNEL')
            });
        }

        $scope.today = new Date();
        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10
        };

        $scope.showPagination = showPagination;
        $scope.confirmDeletion = confirmDeletion;
        $scope.removeSiteFromChannel = removeSiteFromChannel;
        $scope.addSitesForChannel = addSitesForChannel;
        $scope.backToListChannel = backToListChannel;


        function confirmDeletion(site, index) {
            var modalInstance = $modal.open({
                templateUrl: 'tagManagement/site/confirmDeletion.tpl.html'
            });

            modalInstance.result.then(function () {
                return SiteManager.one(site.id).remove()
                    .then(
                    function () {
                        var index = sites.indexOf(site);

                        if (index > -1) {
                            sites.splice(index, 1);
                        }

                        $scope.sites = sites;
                        SiteCache.deleteSite(site);

                        if($scope.tableConfig.currentPage > 0 && sites.length/10 == $scope.tableConfig.currentPage) {
                            $scope.tableConfig.currentPage =- 1;
                        }

                        AlertService.replaceAlerts({
                            type: 'success',
                            message: $translate.instant('SITE_MODULE.DELETE_SUCCESS')
                        });
                    },
                    function () {
                        AlertService.replaceAlerts({
                            type: 'danger',
                            message: $translate.instant('SITE_MODULE.DELETE_FAIL')
                        });
                    }
                )
                    ;
            });
        }

        function removeSiteFromChannel(site, index) {
            var modalInstance = $modal.open({
                templateUrl: 'tagManagement/channel/confirmSiteDeletion.tpl.html'
            });

            modalInstance.result.then(function () {
                return ChannelManager.one(channel.id).one('site', site.id).remove()
                    .then(
                    function () {
                        var index = sites.indexOf(site);

                        if (index > -1) {
                            sites.splice(index, 1);
                        }

                        $scope.sites = sites;

                        if($scope.tableConfig.currentPage > 0 && sites.length/10 == $scope.tableConfig.currentPage) {
                            $scope.tableConfig.currentPage =- 1;
                        }

                        AlertService.replaceAlerts({
                            type: 'success',
                            message: $translate.instant('CHANNEL_MODULE.REMOVE_SITE_FROM_CHANNEL_SUCCESS')
                        });
                    },
                    function () {
                        AlertService.replaceAlerts({
                            type: 'danger',
                            message: $translate.instant('CHANNEL_MODULE.REMOVE_SITE_FROM_CHANNEL_FAIL')
                        });
                    }
                )
                    ;
            });
        }

        function showPagination() {
            return angular.isArray($scope.sites) && $scope.sites.length > $scope.tableConfig.itemsPerPage;
        }

        function addSitesForChannel() {
            $modal.open({
                templateUrl: 'tagManagement/channel/addSitesForChannel.tpl.html',
                size: 'lg',
                backdrop: 'static',
                controller: 'AddSitesForChannel',
                resolve: {
                    channel: function () {
                        return channel;
                    },
                    sites: function() {
                        return SiteManager.getList()
                            .then(function(sites) {
                                return $filter('selectedPublisher')(sites.plain(), channel.publisher);
                            });
                    },
                    sitesChannel : function() {
                        return $scope.sites;
                    }
                }
            });
        }

        function backToListChannel() {
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.channel, '^.list');
        }
    }
})();