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
                searchFields: '=searchFields',
                placeHolder: '=placeHolder'
            },
            controller: function ($scope, $filter) {
                var sbList = angular.copy($scope.sbList);
                $scope.pHolder = ($scope.placeHolder == null || $scope.placeHolder == undefined) ? 'Search' :  $scope.placeHolder;

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
                        if(angular.isObject(item[field]) && item[field] != undefined) {
                            return stringFields += _.values(item[field]).toString();
                        }

                        field = field.split(".");

                        if( field.length > 1) {
                            var curItem = item;
                            var tmpItemVal = null;

                            angular.forEach(field, function(prop){
                                curItem = curItem[prop]
                            });

                            if(angular.isObject(curItem) && curItem != undefined) {
                                return stringFields += _.values(curItem).toString();
                            }

                            return stringFields += curItem;
                        }

                        field = field.shift();

                        return stringFields += item[field] != null ? item[field] : '';
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