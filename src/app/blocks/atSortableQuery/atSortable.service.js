(function () {
    'use strict';

    angular.module('tagcade.blocks.atSortableQuery')
        .factory('AtSortableService', AtSortableService)
    ;

    function AtSortableService($location, COLUMN_HEADER_TO_QUERY_PARAM_MAP, QUERY_PARAM_TO_HEADER_MAP) {
        var api = {
            insertParamForUrl: insertParamForUrl,
            getHeaderFromQueryParam: getHeaderFromQueryParam,
            getQueryParamFromHeader: getQueryParamFromHeader
        };

        return api;

        function insertParamForUrl(query) {
            if(!angular.isObject(query)) {
                return;
            }

            var param = $location.search();

            angular.forEach(query, function(value, key) {
                param[key] = value;
            });

            $location.search(param);
        }

        function getHeaderFromQueryParam(key) {
            return QUERY_PARAM_TO_HEADER_MAP[key] || key;
        }

        function getQueryParamFromHeader(header) {
            return COLUMN_HEADER_TO_QUERY_PARAM_MAP[header] || header;
        }
    }
})();