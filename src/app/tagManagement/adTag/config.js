(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adTag')
        .constant('AD_TYPES', {
            customAd: 0,
            imageAd: 1,
            inBanner: 2
        })
        .constant('MACROS_FOR_AD_TAG', [
            {root: '${CACHEBUSTER}', label: '${CACHEBUSTER}', helpText: "A unique code that ensures URLs are unique"},
            {root: '${PAGE_URL}', label: '${PAGE_URL}', helpText: "The url of the current page"},
            {root: '${DOMAIN}', label: '${DOMAIN}', helpText: "The domain defined manually by user"},
            {root: '${DECLARED_DOMAIN}', label: '${DECLARED_DOMAIN}', helpText: "The domain defined manually by user"},
            {root: '${DETECTED_DOMAIN}', label: '${DETECTED_DOMAIN}', helpText: "The domain of the current website"},
            {root: '${SLOT_ID}', label: '${SLOT_ID}', helpText: "The ad slot ID of the current tag"},
            {root: '${USER_AGENT}', label: '${USER_AGENT}', helpText: "The user agent of the current browser"},
            {root: '${COUNTRY}', label: '${COUNTRY}', helpText: "The country of the current website"},
            {root: '${IP_ADDRESS}', label: '${IP_ADDRESS}', helpText: "The IP address of the current website"},
            {root: '${WIDTH}', label: '${WIDTH}', helpText: "The Ad Slot width"},
            {root: '${HEIGHT}', label: '${HEIGHT}', helpText: "The Ad Slot height"}
        ])
        .run(function(editableOptions) {
            editableOptions.theme = 'bs3';
        });
})();