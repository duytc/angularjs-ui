(function() {
    'use strict';

    angular.module('tagcade.tagLibrary.adSlot')
        .controller('ViewAssociateAdSlots', ViewAssociateAdSlots)
    ;

    function ViewAssociateAdSlots($scope, $modal, adSlots, historyStorage, adSlotService, AlertService, TYPE_AD_SLOT, HISTORY_TYPE_PATH) {
        $scope.adSlots = adSlots;
        $scope.adSlotTypes = TYPE_AD_SLOT;

        $scope.hasData = function () {
            return !!adSlots.length;
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: 'There is currently no ad slots associated'
            });
        }

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10
        };

        $scope.today = new Date();

        $scope.showPagination = showPagination;
        $scope.backToListAdSlot = backToListAdSlot;

        function showPagination() {
            return angular.isArray($scope.adSlots) && $scope.adSlots.length > $scope.tableConfig.itemsPerPage;
        }

        function backToListAdSlot() {
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adSlotLibrary, '^.list');
        }

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

                        if($scope.tableConfig.currentPage > 0 && adSlots.length/10 == $scope.tableConfig.currentPage) {
                            $scope.tableConfig.currentPage =- 1;
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
    }
})();