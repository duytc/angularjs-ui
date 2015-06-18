(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adSlot')
        .controller('AdSlotList', AdSlotList)
    ;

    function AdSlotList($scope, $state, $location, $stateParams, $modal, $q, AlertService, adSlotService, adSlots, site, AtSortableService, historyStorage, HISTORY_TYPE_PATH, TYPE_AD_SLOT_FOR_LIST) {
        $scope.site = site;

        $scope.adSlots = adSlots;
        $scope.types = TYPE_AD_SLOT_FOR_LIST;

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
                controller: function ($scope, javascriptTag, $timeout) {
                    $scope.adSlotName = adSlot.name;
                    $scope.javascriptTag = javascriptTag;

                    $timeout(function() {
                        $scope.editorOptions = {
                            lineWrapping : true,
                            indentUnit: 0,
                            mode : "htmlmixed"
                        };
                    }, 0)
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
                            $state.current.reloadOnSearch = true;
                            historyStorage.getLocationPath(HISTORY_TYPE_PATH.adSlot, $state.current);
                            $state.current.reloadOnSearch = false;

                            AlertService.addFlash({
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

        $scope.$on('$locationChangeSuccess', function() {
            $scope.tableConfig.currentPage = $location.search().page - 1;
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.adSlot)
        });
    }
})();