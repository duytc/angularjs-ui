(function() {
    'use strict';

    angular.module('tagcade.tagManagement', [
        'tagcade.tagManagement.tagGenerator',
        'tagcade.tagManagement.adNetwork',
        'tagcade.tagManagement.site',
        'tagcade.tagManagement.adSlot',
        'tagcade.tagManagement.adTag',
        'tagcade.tagManagement.channel',
        'tagcade.tagManagement.ronAdSlot',
        'tagcade.tagManagement.segment',
        'tagcade.tagManagement.domainList'
    ]);
})();