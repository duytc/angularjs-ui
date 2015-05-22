(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adSlot')
        .controller('AdSlotList', AdSlotList)
    ;

    function AdSlotList($scope, $state, $stateParams, $modal, $q, AlertService, AdSlotManager, DynamicAdSlotManager, adSlots, dynamicAdSlot, site) {
        $scope.site = site;

        $scope.adSlots = dynamicAdSlot.concat(adSlots);

        $scope.hasData = function () {
            return !!adSlots.length;
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: 'There is currently no ad slots in this site'
            });
        }

        $scope.currentSiteId = $stateParams.siteId || null;

        $scope.showPagination = showPagination;

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10
        };

        $scope.generateAdTag = function (adSlot) {
            var Manager = !!adSlot.width ? AdSlotManager : DynamicAdSlotManager;

            var modalInstance = $modal.open({
                templateUrl: 'tagManagement/adSlot/generateAdTag.tpl.html',
                resolve: {
                    javascriptTag: function () {
                        return Manager.one(adSlot.id).customGET('jstag');
                    }
                },
                controller: function ($scope, javascriptTag) {
                    $scope.adSlotName = adSlot.name;
                    $scope.javascriptTag = javascriptTag;
                }
            });
        };

        $scope.confirmDeletion = function (adSlot) {
            var modalInstance = $modal.open({
                templateUrl: 'tagManagement/adSlot/confirmDeletion.tpl.html'
            });

            var Manager = !!adSlot.width ? AdSlotManager : DynamicAdSlotManager;
            modalInstance.result.then(function () {
                return Manager.one(adSlot.id).remove()
                    .then(
                        function () {
                            $state.reload();

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
                    }
                }
            });
        };

        function showPagination() {
            return angular.isArray($scope.adSlots) && $scope.adSlots.length > $scope.tableConfig.itemsPerPage;
        }
    }
})();