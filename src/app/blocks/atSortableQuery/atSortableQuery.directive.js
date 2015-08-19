(function () {
    'use strict';

    angular.module('tagcade.blocks.atSortableQuery')
        .directive('atSortableQuery', atSortableQuery)
    ;

    function atSortableQuery() {
        return {
            restrict: 'A',
            controller: function ($scope, $state, $location, $timeout, AtSortableService, $element) {
                $element.children().first().bind('click', function() {
                    // not reload page when click header table
                    $state.current.reloadOnSearch = false;

                    $timeout(function() {
                        var orderBy = $scope.descending ? 'desc' : 'asc';
                        var sortField = AtSortableService.getHeaderFromQueryParam($scope.predicate);

                        AtSortableService.insertParamForUrl({sortField: sortField, orderBy: orderBy});
                    }, 0);
                });

                $timeout(function() {
                    _updatePropertiesAsUrl(); //when reload
                }, 0);

                // update at table properties according url params
                $scope.$on('$locationChangeSuccess', function() {
                    _updatePropertiesAsUrl();
                });

                function _updatePropertiesAsUrl() {
                    if(!!$location.search().orderBy && !!$location.search().sortField) {
                        $scope.descending = $location.search().orderBy == 'desc' ? true : false;
                        $scope.predicate = AtSortableService.getQueryParamFromHeader($location.search().sortField);
                    }
                }
            }
        }
    }
})();