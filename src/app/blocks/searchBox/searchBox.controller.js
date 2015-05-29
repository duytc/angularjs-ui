(function() {
    'use strict';

    angular.module('tagcade.blocks.searchBox')
        .controller('SearchBox', SearchBox)
    ;

    function SearchBox($scope, $filter, _, $location, AtSortableService) {
        var sbList = $scope.sbList;
        $scope.pHolder = ($scope.placeHolder == null || $scope.placeHolder == undefined) ? 'Search' : $scope.placeHolder;

        $scope.search = function () {
            $scope.sbList = $filter('filter')(sbList, _searchFilter);
        };

        $scope.updateQueryTerm = function() {
            if(!!$scope.showQuery) {
                var term = !!$scope.query ? {search: $scope.query} : {search: null};
                AtSortableService.insertParamForUrl(term);
            }
        };

        update();
        $scope.$on('$locationChangeSuccess', function() {
            update();
        });

        function update() {
            if(!!$scope.showQuery) {
                if(!!$location.search().search) {
                    $scope.query = $location.search().search;
                }
                else {
                    $scope.query = '';
                }

                $scope.sbList = $filter('filter')(sbList, _searchFilter);
            }
        }

        function _searchFilter(item) {
            var found = false;

            var stringFields = '';

            angular.forEach($scope.searchFields, function (field) {
                    if (angular.isObject(item[field]) && item[field] != undefined) {
                        return stringFields += _.values(item[field]).toString();
                    }

                    field = field.split(".");

                    if (field.length > 1) {
                        var curItem = item;

                        // deep access to obect property
                        angular.forEach(field, function (prop) {
                            if (curItem != null && curItem != undefined) {
                                curItem = curItem[prop]
                            }
                        });

                        if (angular.isObject(curItem) && curItem != undefined) {
                            return stringFields += _.values(curItem).toString();
                        }

                        return stringFields += curItem;
                    }

                    field = field.shift();

                    return stringFields += item[field] != null ? item[field] : '';
                }
            );

            // found item is the one has its stringFields containing stringFields
            if ((stringFields.toLowerCase()).indexOf($scope.query.toLowerCase()) != -1) {
                found = true;
            }

            return found;
        }
    }
})();