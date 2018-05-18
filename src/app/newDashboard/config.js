(function () {
    'use strict';

    angular.module('tagcade.newDashboard')
        .constant('PLATFORM_STATISTICS', 'platformStatistics')
        .constant('ACCOUNT_STATISTICS', 'accountStatistics')
        .constant('DEFAULT_DATE_FORMAT', 'YYYY-MM-DD')
        .constant('DEFAULT_DATE_FIELD_DISPLAY_AND_VIDEO', 'date')
        .constant('HOUR_EXTENSION', ':00')
        .constant('CHART_DASH_TYPES', {
            'SOLID': 'Solid',
            'SHORT_DASH': 'ShortDash',
            'LONG_DASH': 'LongDash'
        })
        .constant('LINE_CHART_CONFIG',{
            options: {
                chart: {
                    type: 'line'
                },
                title: {
                    text: 'Current and History Statistics Comparison Chart',
                    margin: 20
                },
                subtitle: {
                    text: 'Solid lines is for Current statistics with date/time on top and dot lines is for History statistics with date/time on bottom',
                    align: 'center'
                },
                plotOptions: {
                    line: {
                        dataLabels: {
                            enabled: false
                        },
                        enableMouseTracking: true
                    },
                    series: {
                        marker: {
                            enabled: false
                        }
                    }
                }
            },
            xAxis: [
                {
                    categories: [],
                    labels: {
                        rotation: -60,
                        // autoRotation: [-10, -20, -30, -40, -50, -60, -70, -80, -90]
                    }
                },
                {
                    categories: [],
                    labels: {
                        rotation: 60,
                        // autoRotation: [-10, -20, -30, -40, -50, -60, -70, -80, -90]
                    },
                    opposite: true // on top of chart
                }],
            yAxis: {
                title: {
                    text: null
                }
            },
            series: []
        })
        .constant('CHART_FOLLOW', {
            'OVER_VIEW': 'OVER_VIEW',
            'COMPARISION': 'COMPARISION'
        })
        .constant('DESC', 'desc')
        .constant('ASC', 'asc')
        .constant('ADMIN_DISPLAY_COMPARISION', 'platform/comparison')
        .constant('PUBLISHER_DISPLAY_COMPARISION', 'accounts/comparison')
        .constant('DASHBOARD_TYPE', [
            {id: 'DISPLAY', name: 'Pubvantage Display'},
            {id: 'UNIFIED_REPORT', name: 'Unified Report'},
            {id: 'VIDEO', name: 'Pubvantage Video'}

        ])
        .constant('DASHBOARD_TYPE_JSON', {
            'DISPLAY': 'Pubvantage Display',
            'UNIFIED_REPORT': 'Unified Report',
            'VIDEO': 'Pubvantage Video'
        })
        .constant('COMPARE_TYPE', {
                'day': 'day-over-day',
                'week': 'week-over-week',
                'month': 'month-over-month',
                'year': 'year-over-year',
                'custom': 'custom',
                'yesterday': 'yesterday'
            }
        )
        .constant('DISPLAY_REPORT_TYPES', {
            platform: 'platform',
            accounts: 'accounts'
        })
        .constant('COLUMNS_NAME_MAPPING_FOR_VIDEO_REPORT', {
            'date': 'Date',
            'billedAmount': 'Billed Amount',
            'requests': 'Requests',
            'impressions': 'Impression',
            'bids': 'Bids',
            'errors': 'Errors',
            'blocks': 'Blocked Requests',
            'requestFillRate': 'Fill Rate',
            'netRevenue': 'Revenue'
        })
        .constant('DISPLAY_SHOW_FIELDS', ['estRevenue', 'slotOpportunities', 'passbacks', 'impressions', 'fillRate'])
        .constant('VIDEO_SHOW_FIELDS', ['billedAmount','netRevenue', 'requests', 'impressions', 'bids', 'errors', 'blocks', 'requestFillRate'])
        .constant('DASHBOARD_COLOR', {
            0: '#1f77b4',
            1: '#ff7f0e',
            2: '#2ca02c',
            3: '#d62728',
            4: '#9467bd',
            5: '#8c564b',
            6: '#e377c2',
            7: '#7f7f7f',
            8: '#bcbd22',
            9: '#17becf',
            10: '#0600cf',
            11: '#5400cf',
            12: '#7c03cf',
            13: '#cf00a4',
            14: '#cf004c',
            15: '#cf4c00',
            16: '#cfaa00',
            17: '#b1cf00',
            18: '#6fcf00',
            19: '#00cf5f',
            20: '#00cf8f',
            21: '#cfba5f',
            22: '#6bcf7f',
            23: '#b9cf79',
            24: '#8aa5cf',
            25: '#cf8ab4',
            26: '#cf937b',
            27: '#cf6967',
            28: '#cf5d7b',
            29: '#9673cf',
            30: '#4e85cf'
        })
        .provider('API_COMPARISION_BASE_URL', {
            $get: function (API_END_POINT) {
                return API_END_POINT + '/statistics/v1';
            }
        })
        .provider('API_UR_COMPARISION_BASE_URL', {
            $get: function (API_UNIFIED_BASE_URL) {
                return API_UNIFIED_BASE_URL + '/reportview';
            }
        })
        .provider('API_VIDEO_DASHBOARD_BASE_URL', {
            $get: function (API_REPORTS_BASE_URL) {
                return API_REPORTS_BASE_URL + '/videoreports';
            }
        })
        .provider('API_UNIFIED_DASHBOARD_BASE_URL', {
            $get: function (API_UNIFIED_BASE_URL) {
                return API_UNIFIED_BASE_URL;
            }
        });
})();
