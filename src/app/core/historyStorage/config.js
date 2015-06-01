(function () {
    'use strict';

    angular.module('tagcade.core.historyStorage')
        .constant('HISTORY_STORAGE_AD_SLOT', 'historyStorageAdSlot')
        .constant('HISTORY_STORAGE_SITE', 'historyStorageSite')
        .constant('HISTORY_STORAGE_AD_NETWORK', 'historyStorageAdNetwork')
        .constant('HISTORY_STORAGE_PUBLISHER_MANAGEMENT', 'historyStoragePublisherManagement')
        .constant('HISTORY_TYPE_PATH', {site: 'site', adSlot: 'adSlot', adNetwork: 'adNetwork', publisher: 'publisher'})
    ;
})();