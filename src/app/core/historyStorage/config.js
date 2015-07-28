(function () {
    'use strict';

    angular.module('tagcade.core.historyStorage')
        .constant('HISTORY', 'tagcadeHistory')
        .constant('HISTORY_TYPE_PATH', {site: 'site', adSlot: 'adSlot', adNetwork: 'adNetwork', publisher: 'publisher', adTag: 'adTag', adTagLibrary: 'adTagLibrary', adSlotLibrary: 'adSlotLibrary'})
    ;
})();