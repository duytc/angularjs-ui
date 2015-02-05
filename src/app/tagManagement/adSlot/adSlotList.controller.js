(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adSlot')
        .controller('AdSlotList', AdSlotList)
    ;

    function AdSlotList($scope, $stateParams, $modal, $q, AlertService, AdSlotManager, adSlots, site) {
        $scope.site = site;

        $scope.adSlots = adSlots;

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
            var modalInstance = $modal.open({
                templateUrl: 'tagManagement/adSlot/generateAdTag.tpl.html',
                resolve: {
                    javascriptTag: function (AdSlotManager) {
                        return AdSlotManager.one(adSlot.id).customGET('jstag');
                    }
                },
                controller: function ($scope, javascriptTag) {
                    $scope.adSlotName = adSlot.name;
                    $scope.javascriptTag = angular.fromJson(javascriptTag);
                }
            });
        };

        $scope.confirmDeletion = function (adSlot, index) {
            var modalInstance = $modal.open({
                templateUrl: 'tagManagement/adSlot/confirmDeletion.tpl.html'
            });

            modalInstance.result.then(function () {
                return AdSlotManager.one(adSlot.id).remove()
                    .then(
                        function () {
                            var index = adSlots.indexOf(adSlot);

                            if (index > -1) {
                                adSlots.splice(index, 1);
                            }

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

        function showPagination() {
            return angular.isArray($scope.adSlots) && $scope.adSlots.length > $scope.tableConfig.itemsPerPage;
        }
    }
})();