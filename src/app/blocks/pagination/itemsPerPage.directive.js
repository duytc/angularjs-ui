(function () {
    'use strict';

    angular.module('tagcade.blocks.pagination')
        .directive('itemsPerPage', itemsPerPage)
    ;

    function itemsPerPage() {
        'use strict';

        return {
            restrict: 'E',
            templateUrl: 'blocks/pagination/itemsPerPage.tpl.html',
            scope: {
                init: '=',
                range: '=',
                sources: '='
            },
            controller: function ($scope) {
                $scope.isVisible = $scope.sources.length > 0;
                $scope.selectItemPerPages = selectItemPerPages;
                function selectItemPerPages(item) {
                    $scope.init = item.key;
                }
            }
        };
    }
})();