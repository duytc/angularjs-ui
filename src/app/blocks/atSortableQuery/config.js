(function () {
    'use strict';

    angular.module('tagcade.blocks.atSortableQuery')
        .constant('COLUMN_HEADER_TO_QUERY_PARAM_MAP',
            {publisher: 'publisher.username', site: 'site.name'}
        )
        .constant('QUERY_PARAM_TO_HEADER_MAP', {'publisher.username':'publisher', 'site.name': 'site'})
        .constant('EVENT_ACTION_SORTABLE', 'action_sortable')
    ;
})();