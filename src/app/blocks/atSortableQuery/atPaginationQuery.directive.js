(function () {
    'use strict';

    angular.module('tagcade.blocks.atSortableQuery')
        .directive('atPaginationQuery', atPaginationQuery)
    ;

    function atPaginationQuery() {
        return {
            restrict: 'A',
            controller: function ($scope, $state, $location, AtSortableService) {
                var numberChange = 0;

                $scope.$watch(
                    function() {
                        return $scope.getCurrentPage();
                    },
                    function () {
                        // not reload page when click choose page
                        $state.current.reloadOnSearch = false;
                        numberChange++;

                        if(!!$location.search().page && numberChange == 1) {
                            return $scope.goToPage($location.search().page - 1)
                        }

                        if($scope.getCurrentPage() != 0 || numberChange != 1) {
                            AtSortableService.insertParamForUrl({page: $scope.getCurrentPage() + 1});
                        }
                });

                $scope.$on('$locationChangeSuccess', function() {
                    $scope.goToPage($location.search().page - 1)
                });
            }
        }
    }
})();