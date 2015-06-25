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
                        'performance': {
                            'adTag' : {
                                'networkOpportunities' : {
                                    label: 'Network Opportunities',
                                    show: true
                                },
                                'firstOpportunities' : {
                                    label: 'First Opportunities',
                                    show: true
                                },
                                'impressions' : {
                                    label: 'Impressions',
                                    show: true
                                },
                                'verifiedImpressions' : {
                                    label: 'Verified Impressions',
                                    show: true
                                },
                                'unverifiedImpressions' : {
                                    label: 'Unverified Impressions',
                                    show: true
                                },
                                'clicks' : {
                                    label: 'Clicks',
                                    show: true
                                },
                                'passbacks' : {
                                    label: 'Passbacks',
                                    show: true
                                },
                                'fillRate' : {
                                    label: 'Fill Rate',
                                    show: true
                                }
                            }
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