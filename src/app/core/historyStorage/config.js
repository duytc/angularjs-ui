(function () {
    'use strict';

    angular.module('tagcade.core.historyStorage')
        .constant('HISTORY', 'tagcadeHistory')
        .constant('HISTORY_TYPE_PATH', {site: 'site', adSlot: 'adSlot', adNetwork: 'adNetwork', publisher: 'publisher', adTagAdNetwork: 'adTagAdNetwork', adTagLibrary: 'adTagLibrary', adSlotLibrary: 'adSlotLibrary', channel: 'channel', ronAdSlot: "ronAdSlot", segment: "segment", exchange: "exchange"})
    ;
})();