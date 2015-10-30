(function() {
    'use strict';

    angular.module('tagcade.tagManagement.ronAdSlot')
        .controller('RonAdSlotList', RonAdSlotList)
    ;

    function RonAdSlotList($scope, $modal, $translate, AlertService, ronAdSlots, historyStorage, HISTORY_TYPE_PATH, RonAdSlotManager, AtSortableService) {
        $scope.ronAdSlots = ronAdSlots;
        $scope.hasData = function () {
            return !!ronAdSlots.length;
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: $translate.instant('RON_AD_SLOT_MODULE.CURRENTLY_NO_RON_AD_SLOT')
            });
        }

        $scope.today = new Date();

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10
        };

        $scope.showPagination = showPagination;
        $scope.confirmDeletion = confirmDeletion;

        function confirmDeletion(ronAdSlot) {
            var modalInstance = $modal.open({
                templateUrl: 'tagManagement/ronAdSlot/confirmDeletion.tpl.html'
            });
            modalInstance.result.then(function(){
                return RonAdSlotManager.one(ronAdSlot.id).remove()
                    .then(function(){
                        var index = ronAdSlots.indexOf(ronAdSlot);

                        if (index > -1) {
                            ronAdSlots.splice(index, 1);
                        }

                        $scope.ronAdSlots = ronAdSlots;

                        if($scope.tableConfig.currentPage > 0 && ronAdSlots.length/10 == $scope.tableConfig.currentPage) {
                            AtSortableService.insertParamForUrl({page: $scope.tableConfig.currentPage});
                        }
                        AlertService.replaceAlerts({
                            type: 'success',
                            message: $translate.instant('RON_AD_SLOT_MODULE.DELETE_SUCCESS')
                        });
                    })
                    .catch(function() {
                        AlertService.replaceAlerts({
                            type: 'danger',
                            message: $translate.instant('RON_AD_SLOT_MODULE.DELETE_FAIL')
                        });
                    });
            });
        }

        $scope.generateAdTag = function (ronAdSlot) {
            $modal.open({
                templateUrl: 'tagManagement/ronAdSlot/generateAdTag.tpl.html',
                resolve: {
                    javascriptTag: function () {
                        return RonAdSlotManager.one(ronAdSlot.id).customGET('jstag');
                    }
                },
                controller: function ($scope, javascriptTag) {
                    $scope.adSlotName = ronAdSlot.libraryAdSlot.name;
                    $scope.javascriptTag = javascriptTag.jstag;
                    $scope.getTextToCopy = function(string) {
                        return string.replace(/\n/g, '\r\n');
                    };

                    var globalReport = $translate.instant('SEGMENT_MODULE.GLOBAL_REPORT_SEGMENT');

                    $scope.segmentList = Object.keys(javascriptTag.segments);
                    $scope.segmentList.unshift(globalReport);

                    $scope.selectedSegmentModel = globalReport;

                    $scope.selectSegment = function(type){
                        $scope.javascriptTag = type == globalReport ? javascriptTag.jstag : javascriptTag.segments[type];
                    };

                }
            });
        };

        function showPagination() {
            return angular.isArray($scope.ronAdSlots) && $scope.ronAdSlots.length > $scope.tableConfig.itemsPerPage;
        }

        $scope.$on('$locationChangeSuccess', function() {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.ronAdSlot)
        });
    }
})();