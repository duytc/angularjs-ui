(function () {
    'use strict';

    angular.module('tagcade.blocks.atSortableQuery')
        .directive('atActionSortableQuery', atActionSortableQuery)
    ;

    function atActionSortableQuery() {
        return {
            restrict: 'A',
            controller: function ($scope, $timeout, $rootScope, $element, EVENT_ACTION_SORTABLE) {
                $element.children().first().find('th[ng-click]').bind('click', function() {
                    $timeout(function() {
                        var params = {sortField: $scope.predicate, orderBy: $scope.descending ? 'desc' : 'asc'};
                        console.log(params);
                        $rootScope.$broadcast(EVENT_ACTION_SORTABLE, params);
                    }, 0);

                });
            }
        }
    }
})();