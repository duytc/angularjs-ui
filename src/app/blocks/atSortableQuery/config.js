(function () {
    'use strict';

    angular.module('tagcade.blocks.atSortableQuery')
        .constant('COLUMN_HEADER_TO_QUERY_PARAM_MAP',
            {publisher: 'publisher.username'}
        )
        .constant('QUERY_PARAM_TO_HEADER_MAP', {'publisher.username':'publisher'})
    ;
})();