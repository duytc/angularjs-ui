(function() {
    'use strict';

    angular.module('tagcade.blocks.billingConfig')
        .constant('MODULES_BILLING_CONFIG', [
            { label: 'Display', role: 'MODULE_DISPLAY' },
            { label: 'Video', role: 'MODULE_VIDEO' },
            { label: 'Source report', role: 'MODULE_ANALYTICS' },
            { label: 'Header Bidding', role: 'MODULE_HEADER_BIDDING' },
            { label: 'In-Banner', role: 'MODULE_IN_BANNER' }
        ])
        .constant('BILLING_FACTORS', [
            { label: 'Slot opportunity', key: 'SLOT_OPPORTUNITY', supportForModule: ['MODULE_DISPLAY']},
            { label: 'In-Banner Impression', key: 'VIDEO_AD_IMPRESSION', supportForModule: ['MODULE_IN_BANNER']},
            { label: 'Video impression', key: 'VIDEO_IMPRESSION', supportForModule: ['MODULE_ANALYTICS', 'MODULE_VIDEO']},
            { label: 'Visit', key: 'VISIT', supportForModule: ['MODULE_ANALYTICS']},
            { label: 'Bid Request', key: 'BID_REQUEST', supportForModule: ['MODULE_HEADER_BIDDING']}
        ])
    ;
})();