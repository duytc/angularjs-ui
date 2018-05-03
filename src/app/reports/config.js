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
                                {
                                    key: 'inBannerImpressions',
                                    label: 'In Banner Impressions',
                                    show: false
                                },
                                {
                                    key: 'networkOpportunityFillRate',
                                    label: 'Network Op Fill Rate',
                                    show: true
                                },
                                {
                                    key: 'clicks',
                                    label: 'Clicks',
                                    show: false,
                                    hideForNativeAdSlot: true,
                                    hideForAdmin: true
                                },
                                {
                                    key: 'fillRate',
                                    label: 'Fill Rate',
                                    show: false,
                                    hideForAdmin: true
                                },
                                {
                                    key: 'refreshes',
                                    label: 'Refreshes',
                                    show: true
                                },
                                {
                                    key: 'voidImpressions',
                                    label: 'Void Impressions',
                                    show: false,
                                    hideForNativeAdSlot: true,
                                    hideForAdmin: false
                                },
                                {
                                    key: 'estRevenue',
                                    label: 'Est. Revenue',
                                    show: true,
                                    hideForAdmin: true
                                }
                            ],
                            siteAdNetwork : [
                                {
                                    key : 'totalOpportunities',
                                    label: 'Network Ops',
                                    isPublisherView: true,
                                    isAdminView: true
                                },
                                {
                                    key : 'adOpportunities',
                                    label: 'Impression Ops', // old: Ad Ops
                                    isPublisherView: true,
                                    isAdminView: true
                                },
                                {
                                    key: 'firstOpportunities',
                                    label: 'First Ops',
                                    isPublisherView: true,
                                    isAdminView: true,
                                    hideForNativeAdSlot: true
                                },
                                {
                                    key: 'inBannerImpressions',
                                    label: 'In Banner Impressions',
                                    isPublisherView: true,
                                    isAdminView: true
                                },
                                {
                                    key: 'networkOpportunityFillRate',
                                    label: 'Network Op Fill Rate',
                                    isPublisherView: true,
                                    isAdminView: true
                                },
                                {
                                    key: 'passbacks',
                                    label: 'Passbacks',
                                    isPublisherView: true,
                                    isAdminView: true,
                                    hideForNativeAdSlot: true
                                },
                                {
                                    key: 'blankImpressions',
                                    label: 'Blank Impressions',
                                    isPublisherView: false,
                                    isAdminView: true,
                                    hideForNativeAdSlot: true
                                },
                                {
                                    key: 'clicks',
                                    label: 'Clicks',
                                    isPublisherView: true,
                                    isAdminView: true,
                                    hideForNativeAdSlot: true
                                },
                                {
                                    key: 'fillRate',
                                    label: 'Fill Rate',
                                    isPublisherView: false,
                                    isAdminView: true,
                                    hideForNativeAdSlot: true
                                },
                                {
                                    key: 'voidImpressions',
                                    label: 'Void Impressions',
                                    isPublisherView: false,
                                    isAdminView: true,
                                    hideForNativeAdSlot: true
                                },
                                {
                                    key: 'estRevenue',
                                    label: 'Est. Revenue',
                                    isPublisherView: true,
                                    isAdminView: false
                                },
                                {
                                    key: 'supplyCost',
                                    label: 'Supply Cost',
                                    isPublisherView: true,
                                    isAdminView: false
                                },
                                {
                                    key: 'estProfit',
                                    label: 'Est Profit',
                                    isPublisherView: true,
                                    isAdminView: false
                                }
                            ],
                            adNetworkSite : [
                                {
                                    key : 'totalOpportunities',
                                    label: 'Network Ops',
                                    isPublisherView: true,
                                    isAdminView: true
                                },
                                {
                                    key : 'adOpportunities',
                                    label: 'Impression Ops', // old: Ad Ops
                                    isPublisherView: true,
                                    isAdminView: true
                                },
                                {
                                    key: 'firstOpportunities',
                                    label: 'First Ops',
                                    isPublisherView: true,
                                    isAdminView: true,
                                    hideForNativeAdSlot: true
                                },
                                {
                                    key: 'passbacks',
                                    label: 'Passbacks',
                                    isPublisherView: true,
                                    isAdminView: true,
                                    hideForNativeAdSlot: true
                                },
                                {
                                    key: 'inBannerImpressions',
                                    label: 'In Banner Impressions',
                                    isPublisherView: true,
                                    isAdminView: true
                                },
                                {
                                    key: 'networkOpportunityFillRate',
                                    label: 'Network Op Fill Rate',
                                    isPublisherView: true,
                                    isAdminView: true
                                },
                                {
                                    key: 'blankImpressions',
                                    label: 'Blank Impressions',
                                    isPublisherView: false,
                                    isAdminView: true,
                                    hideForNativeAdSlot: true
                                },
                                {
                                    key: 'clicks',
                                    label: 'Clicks',
                                    isPublisherView: true,
                                    isAdminView: true,
                                    hideForNativeAdSlot: true
                                },
                                {
                                    key: 'fillRate',
                                    label: 'Fill Rate',
                                    isPublisherView: false,
                                    isAdminView: true,
                                    hideForNativeAdSlot: true
                                },
                                {
                                    key: 'voidImpressions',
                                    label: 'Void Impressions',
                                    isPublisherView: false,
                                    isAdminView: true,
                                    hideForNativeAdSlot: true
                                },
                                {
                                    key: 'estRevenue',
                                    label: 'Est. Revenue',
                                    isPublisherView: true,
                                    isAdminView: false
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
        .constant('ADDITION_FIELDS_FOR_PRICE', [
                {
                    key : 'estRevenue',
                    label: 'Est Revenue'
                },
                {
                    key : 'supplyCost',
                    label: 'Supply Cost'
                },
                {
                    key : 'estProfit',
                    label: 'Est Profit'
                }
            ]
        )
        .provider('API_REPORTS_BASE_URL', {
            $get: function(API_END_POINT) {
                return API_END_POINT + '/reports/v1';
            }
        })
    ;
})();