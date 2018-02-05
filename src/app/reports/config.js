(function() {
    'use strict';

    angular.module('tagcade.reports')
        .constant('REPORT_DATE_FORMAT', 'YYYY-MM-DD')
        .constant('REPORT_SERVER_DATE_FORMAT', 'YYYY-MM-DD')
        .constant('REPORT_PRETTY_DATE_FORMAT', 'MMM DD, YYYY')
        .constant('REPORT_TYPES', {
            platform: 'platform',
            account: 'account',
            site: 'site'
        })
        .constant('REPORT_SETTINGS', {
            default: {
                view: {
                    report: {
                        performance: {
                            adTag : [
                                {
                                    key : 'totalOpportunities',
                                    label: 'Network Ops',
                                    show: true
                                },
                                {
                                    key : 'adOpportunities',
                                    label: 'Impression Ops', // old: Ad Ops
                                    show: true
                                },
                                {
                                    key: 'firstOpportunities',
                                    label: 'First Ops',
                                    show: true,
                                    hideForNativeAdSlot: true
                                },
                                {
                                    key: 'passbacks',
                                    label: 'Passbacks',
                                    show: true,
                                    hideForNativeAdSlot: true
                                },
                                // {
                                //     key: 'impressions',
                                //     label: 'Impressions',
                                //     show: true
                                // },
                                {
                                    key: 'inBannerImpressions',
                                    label: 'In Banner Impressions',
                                    show: false
                                },
                                {
                                    key: 'networkOpportunityFillRate',
                                    label: 'Network Opportunity Fill Rate',
                                    show: true
                                },
                                //{
                                //    key: 'verifiedImpressions',
                                //    label: 'Verified Impressions',
                                //    show: true,
                                //    hideForNativeAdSlot: true
                                //},
                                {
                                    key: 'unverifiedImpressions',
                                    label: 'Unverified Impressions',
                                    show: false,
                                    hideForNativeAdSlot: true
                                },
                                // {
                                //     key: 'blankImpressions',
                                //     label: 'Blank Impressions',
                                //     show: true,
                                //     hideForNativeAdSlot: true,
                                //     hideForAdmin: true
                                // },
                                {
                                    key: 'clicks',
                                    label: 'Clicks',
                                    show: false,
                                    hideForNativeAdSlot: true
                                },
                                {
                                    key: 'fillRate',
                                    label: 'Fill Rate',
                                    show: false
                                },
                                {
                                    key: 'refreshes',
                                    label: 'Refreshes',
                                    show: true
                                },
                                {
                                    key: 'voidImpressions',
                                    label: 'Void Impressions',
                                    show: true,
                                    hideForNativeAdSlot: true,
                                    hideForAdmin: true
                                }
                            ]
                        },
                        videoReport: {
                            metrics: [],
                            filters: {
                                publisher: [],
                                waterfallTag: [],
                                demandPartner: [],
                                videoDemandAdTag: [],
                                videoPublisher: []
                            },
                            breakdowns: ['day']
                        }
                    }
                }
            }
        })

        .provider('API_REPORTS_BASE_URL', {
            $get: function(API_END_POINT) {
                return API_END_POINT + '/reports/v1';
            }
        })
    ;
})();