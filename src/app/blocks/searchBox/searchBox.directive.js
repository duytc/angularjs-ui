(function () {
    'use strict';

    angular.module('tagcade.blocks.searchBox')
        .directive('searchBox', searchBox)
    ;

    function searchBox() {
        'use strict';

        return {
            restrict: 'AE',
            templateUrl: 'blocks/searchBox/searchBox.tpl.html',
            scope: {
                sbList: '=sbList'
            },
            controller: function ($scope, $filter) {
                var sbList = angular.copy($scope.sbList);
                $scope.search = function() {
                    $scope.sbList = $filter('filter')(sbList, $scope.query);
                }
            }
        };
    }
})();