(function () {
    'use strict';

    angular.module('tagcade.tagManagement.adSlot')
        .constant('TYPE_AD_SLOT', {adSlot: 'Display Ad Slot', nativeAdSlot: 'Native Ad Slot', dynamicAdSlot: 'Dynamic Ad Slot'})
        .constant('TYPE_AD_SLOT_FOR_LIST', {static: 'display', dynamic: 'dynamic', native: 'native'})
    ;
})();