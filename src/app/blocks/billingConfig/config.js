(function() {
    'use strict';

    angular.module('tagcade.blocks.billingConfig')
        .constant('MODULES_BILLING_CONFIG', [
            { label: 'Display', role: 'MODULE_DISPLAY' },
            { label: 'Source report', role: 'MODULE_VIDEO_ANALYTICS' }
        ])
        .constant('BILLING_FACTORS', [
            { label: 'Slot opportunity', key: 'SLOT_OPPORTUNITY', supportForModule: ['MODULE_DISPLAY']},
            { label: 'Video impression', key: 'VIDEO_IMPRESSION', supportForModule: ['MODULE_VIDEO_ANALYTICS']},
            { label: 'Visit', key: 'VISIT', supportForModule: ['MODULE_VIDEO_ANALYTICS']}
        ])
    ;
})();