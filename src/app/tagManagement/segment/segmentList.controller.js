(function() {
    'use strict';

    angular.module('tagcade.tagManagement.segment')
        .controller('SegmentList', SegmentList)
    ;

    function SegmentList($scope, $translate, segments, $modal, AlertService, historyStorage, HISTORY_TYPE_PATH, SegmentManager,AtSortableService) {
        $scope.segments = segments;

        $scope.hasData = function () {
            return !!segments.length;
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: $translate.instant('SEGMENT_MODULE.CURRENTLY_SEGMENT')
            });
        }

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10
        };

        $scope.showPagination = showPagination;
        $scope.confirmDeletion = confirmDeletion;

        function confirmDeletion(segment) {
            var modalInstance = $modal.open({
                templateUrl: 'tagManagement/segment/confirmDeletion.tpl.html'
            });
            modalInstance.result.then(function(){
                return SegmentManager.one(segment.id).remove()
                    .then(function(){
                        var index = segments.indexOf(segment);

                        if (index > -1) {
                            segments.splice(index, 1);
                        }

                        $scope.segments = segments;

                        if($scope.tableConfig.currentPage > 0 && segments.length/10 == $scope.tableConfig.currentPage) {
                            AtSortableService.insertParamForUrl({page: $scope.tableConfig.currentPage});
                        }
                        AlertService.replaceAlerts({
                            type: 'success',
                            message: $translate.instant('SEGMENT_MODULE.DELETE_SUCCESS')
                        });
                    })
                    .catch(function() {
                        AlertService.replaceAlerts({
                            type: 'success',
                            message: $translate.instant('SEGMENT_MODULE.DELETE_FAIL')
                        });
                    });
            });
        }

        function showPagination() {
            return angular.isArray($scope.segments) && $scope.segments.length > $scope.tableConfig.itemsPerPage;
        }

        $scope.$on('$locationChangeSuccess', function() {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.segment)
        });
    }
})();