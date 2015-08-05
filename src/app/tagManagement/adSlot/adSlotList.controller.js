(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adSlot')
        .controller('AdSlotList', AdSlotList)
    ;

    function AdSlotList($scope, $location, $stateParams, $modal, AlertService, adSlotService, adSlots, site, AtSortableService, libraryAdSlotService, historyStorage, HISTORY_TYPE_PATH, TYPE_AD_SLOT) {
        $scope.site = site;

        $scope.adSlots = adSlots;
        $scope.adSlotTypes = TYPE_AD_SLOT;

        $scope.hasData = function () {
            return !!adSlots.length;
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: 'There is currently no ad slots in this site'
            });
        }

        $scope.today = new Date();
        $scope.allAdSlot = !$stateParams.siteId;
        $scope.currentSiteId = $stateParams.siteId || null;

        $scope.showPagination = showPagination;
        $scope.setCurrentPageForUrl = setCurrentPageForUrl;
        $scope.backToListSite = backToListSite;
        $scope.exist = exist;
        $scope.shareAdSlot = shareAdSlot;

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10,
            currentPage: $location.search().page - 1 || 0
        };

        $scope.generateAdTag = function (adSlot) {
            var Manager = adSlotService.getManagerForAdSlot(adSlot);

            $modal.open({
                templateUrl: 'tagManagement/adSlot/generateAdTag.tpl.html',
                resolve: {
                    javascriptTag: function () {
                        return Manager.one(adSlot.id).customGET('jstag');
                    }
                },
                controller: function ($scope, javascriptTag) {
                    $scope.adSlotName = adSlot.libraryAdSlot.name;
                    $scope.javascriptTag = javascriptTag;
                    $scope.getTextToCopy = function(string) {
                        return string.replace(/\n/g, '\r\n');
                    };
                }
            });
        };

        $scope.confirmDeletion = function (adSlot) {
            var modalInstance = $modal.open({
                templateUrl: 'tagManagement/adSlot/confirmDeletion.tpl.html'
            });

            var Manager = adSlotService.getManagerForAdSlot(adSlot);

            modalInstance.result.then(function () {
                return Manager.one(adSlot.id).remove()
                    .then(
                        function () {
                            var index = adSlots.indexOf(adSlot);

                            if (index > -1) {
                                adSlots.splice(index, 1);
                            }

                            $scope.adSlots = adSlots;

                            AlertService.replaceAlerts({
                                type: 'success',
                                message: 'The ad slot was deleted'
                            });
                        },
                        function () {
                            AlertService.replaceAlerts({
                                type: 'danger',
                                message: 'The ad slot could not be deleted'
                            });
                        }
                    )
                ;
            });
        };

        $scope.cloneAdSlot = function(adSlot) {
            $modal.open({
                templateUrl: 'tagManagement/adSlot/cloneAdSlot.tpl.html',
                size: 'lg',
                controller: 'CloneAdSlot',
                resolve: {
                    adSlot: function () {
                        return adSlot;
                    },
                    Manager: function() {
                        return adSlotService.getManagerForAdSlot(adSlot);
                    }
                }
            });
        };

        function showPagination() {
            return angular.isArray($scope.adSlots) && $scope.adSlots.length > $scope.tableConfig.itemsPerPage;
        }

        function setCurrentPageForUrl() {
            AtSortableService.insertParamForUrl({page: $scope.tableConfig.currentPage + 1});
        }

        function backToListSite() {
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.site, '^.^.sites.list');
        }

        function exist(type, typeCompare) {
            if(type == typeCompare) {
                return true;
            }

            return false;
        }

        function shareAdSlot(adSlot) {
            var libraryAdSlot = {
                visible: true
            };

            var Manager = libraryAdSlotService.getManagerForAdSlotLibrary(adSlot);
            Manager.one(adSlot.libraryAdSlot.id).patch(libraryAdSlot)
                .then(function () {
                    adSlot.libraryAdSlot.visible = true;

                    AlertService.replaceAlerts({
                        type: 'success',
                        message: 'The ad slot has been moved to library'
                    });
                })
                .catch(function () {
                    AlertService.replaceAlerts({
                        type: 'error',
                        message: 'The ad slot has not been moved to library'
                    });
                })
            ;
        }

        $scope.$on('$locationChangeSuccess', function() {
            $scope.tableConfig.currentPage = $location.search().page - 1;
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.adSlot)
        });
    }
})();