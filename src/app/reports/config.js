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
                                    label: 'Network Opportunities',
                                    show: true
                                },
                                {
                                    key : 'adOpportunities',
                                    label: 'Ad Opportunities',
                                    show: true
                                },
                                {
                                    key: 'firstOpportunities',
                                    label: 'First Opportunities',
                                    show: true,
                                    hideForNativeAdSlot: true
                                },
                                {
                                    key: 'impressions',
                                    label: 'Impressions',
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
                                    show: true,
                                    hideForNativeAdSlot: true
                                },
                                {
                                    key: 'blankImpressions',
                                    label: 'Blank Impressions',
                                    show: true,
                                    hideForNativeAdSlot: true,
                                    hideForAdmin: true
                                },
                                {
                                    key: 'voidImpressions',
                                    label: 'Void Impressions',
                                    show: true,
                                    hideForNativeAdSlot: true,
                                    hideForAdmin: true
                                },
                                {
                                    key: 'clicks',
                                    label: 'Clicks',
                                    show: true,
                                    hideForNativeAdSlot: true
                                },
                                {
                                    key: 'passbacks',
                                    label: 'Passbacks',
                                    show: true,
                                    hideForNativeAdSlot: true
                                },
                                {
                                    key: 'fillRate',
                                    label: 'Fill Rate',
                                    show: true
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