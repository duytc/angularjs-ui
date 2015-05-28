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
                sbList: '=sbList',
                searchFields: '=searchFields',
                placeHolder: '=placeHolder',
                showQuery: '=showQuery'
            },
            controller: 'SearchBox'
        };
    }
})();