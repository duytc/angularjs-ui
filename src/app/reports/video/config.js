(function() {
    'use strict';

    angular.module('tagcade.reports.video')
        .constant('BREAKDOWN_OPTION_FOR_VIDEO_REPORT', [
            {
                label: 'By Day',
                key: 'day'
            },
            {
                label: 'By Publisher',
                key: 'publisher'
            },
            {
                label: 'By Video Publisher',
                key: 'videoPublisher'
            },
            {
                label: 'By Demand Partner',
                key: 'demandPartner'
            },
            {
                label: 'By Waterfall',
                key: 'waterfallTag'
            },
            {
                label: 'By Demand Ad Tag',
                key: 'videoDemandAdTag'
            }
        ])
        .constant('DIMENSIONS_OPTIONS_VIDEO_REPORT', [
            {
                key: 'requests',
                label: 'Requests'
            },
            {
                key: 'bids',
                label: 'Bids'
            },
            {
                key: 'bidRate',
                label: 'Bid Rate'
            },
            {
                key: 'errors',
                label: 'Errors'
            },
            {
                key: 'errorRate',
                label: 'Error Rate'
            },
            //{
            //    key: 'wonOpportunities',
            //    label: 'Won Opportunities'
            //},
            {
                key: 'impressions',
                label: 'Impressions'
            },
            {
                key: 'requestFillRate',
                label: 'Request Fill Rate'
            },
            {
                key: 'clicks',
                label: 'Clicks'
            },
            {
                key: 'clickThroughRate',
                label: 'Click Through Rate'
            },
            {
                key: 'blocks',
                label: 'Blocks'
            },
            // for adtag
            {
                key: 'adTagRequests',
                label: 'Waterfall Requests'
            },
            {
                key: 'adTagBids',
                label: 'Waterfall Bids'
            },
            {
                key: 'adTagErrors',
                label: 'Waterfall Errors'
            },
            {
                key: 'estDemandRevenue',
                label: 'Demand Revenue'
            },
            {
                key: 'estSupplyCost',
                label: 'Supply Cost'
            },
            {
                key: 'netRevenue',
                label: 'Net Revenue'
            }
        ])
        .provider('API_VIDEO_REPORTS_BASE_URL', {
            $get: function(API_REPORTS_BASE_URL) {
                return API_REPORTS_BASE_URL + '/videoreports/video/report';
            }
        })
    ;
})();