(function () {
    'use strict';

    angular.module('tagcade.blocks.searchBox')
        .directive('searchBox', searchBox)
        .filter('searchFilter', searchFilter)
    ;

    function searchBox() {
        'use strict';

        return {
            restrict: 'AE',
            templateUrl: 'blocks/searchBox/searchBox.tpl.html',
            scope: {
                sbList: '=sbList',
                searchFields: '=searchFields'
            },
            controller: function ($scope, $filter) {
                var sbList = angular.copy($scope.sbList);
                $scope.search = function() {
                    $scope.sbList = $filter('searchFilter')(sbList, $scope.query, $scope.searchFields);
                }
            }
        };
    }

    function searchFilter(_) {
        return function(sbList, searchText, searchFields) {
            var resultList = [];

            angular.forEach(sbList, function(item) {
                var stringFields = '';

                angular.forEach(searchFields, function(field) {
                        if(angular.isObject(item[field])) {
                            stringFields += _.values(item[field]).toString();
                        }
                        else {
                            stringFields += item[field] != null ? item[field] : '';
                        }
                    }
                );

                if ((stringFields.toLowerCase()).indexOf(searchText.toLowerCase()) != -1) {
                    resultList.push(item);
                }
            });

            return resultList;
        }
    }
})();