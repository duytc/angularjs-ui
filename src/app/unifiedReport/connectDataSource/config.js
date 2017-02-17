(function () {
    'use strict';

    angular.module('tagcade.unifiedReport.connect')
        .constant('FIELDS_CONNECT_DATA_SOURCE', [
            {key: 'day', label: 'Days'},
            {key: 'url', label: 'URLs'},
            {key: 'tag', label: 'Tags'},
            {key: 'inventoryType', label: 'Inventory Types'},
            {key: 'countries', label: 'Countries'},
            {key: 'adRequest', label: 'Ad Requests'},
            {key: 'estimatedRevenue', label: 'Estimated Revenue'},
            {key: 'adImpression', label: 'Ad Impressions'}
        ])
        .constant('FIELD_TYPES', [
            {key: 'date', label: 'Date'},
            {key: 'text', label: 'Text'},
            {key: 'number', label: 'Number'}
        ])
        .constant('DATE_FORMAT_TYPES', [
            {label: moment().format('YYYY-MM-DD') + ' (YYYY-MM-DD)', key: 'Y-m-d'},   //2016-01-15
            {label: moment().format('YYYY/MM/DD') + ' (YYYY/MM/DD)', key: 'Y/m/d'},   //2016/01/15
            {label: moment().format('MM-DD-YYYY') + ' (MM-DD-YYYY)', key: 'm-d-Y'},   //01-15-2016
            {label: moment().format('MM/DD/YYYY') + ' (MM/DD/YYYY)', key: 'm/d/Y'},   //01/15/2016
            {label: moment().format('DD-MM-YYYY') + ' (DD-MM-YYYY)', key: 'd-m-Y'},   //15-01-2016
            {label: moment().format('DD/MM/YYYY') + ' (DD/MM/YYYY)', key: 'd/m/Y'},   //15/01/2016
            {label: moment().format('YYYY-MMM-DD') + ' (YYYY-MON-DD)', key: 'Y-M-d'},   //2016-Jan-15
            {label: moment().format('YYYY/MMM/DD') + ' (YYYY/MON/DD)', key: 'Y/M/d'},   //2016-Jan-15
            {label: moment().format('MMM-DD-YYYY') + ' (MON-DD-YYYY)', key: 'M-d-Y'},   //Jan-15-2016
            {label: moment().format('MMM/DD/YYYY') + ' (MON/DD/YYYY)', key: 'M/d/Y'},   //Jan/15/2016
            {label: moment().format('DD-MMM-YYYY') + ' (DD-MON-YYYY)', key: 'd-M-Y'},   //15-Jan-2016
            {label: moment().format('DD/MMM/YYYY') + ' (DD/MON/YYYY)', key: 'd/M/Y'},    //15/Jan/2016
            {label: moment().format('MMM DD, YYYY') + ' (MON DD, YYYY)', key: 'M d, Y'},    //Jan 15, 2016
            {label: moment().format('YYYY, MMM DD') + ' (YYYY, MON DD)', key: 'Y, M d'},    //2016, Jan 15

            /** Support 2 digit years*/
            {label: moment().format('MM/DD/YY') + ' (MM/DD/YY)', key: 'm/d/y'},   //01/15/99
            {label: moment().format('MM-DD-YY') + ' (MM-DD-YY)', key: 'm-d-y'},   //01-15-99
            {label: moment().format('DD/MM/YY') + ' (DD/MM/YY)', key: 'd/m/y'},   //15/01/99
            {label: moment().format('DD-MM-YY') + ' (DD-MM-YY)', key: 'd-m-y'},   //15-01-99
            {label: moment().format('YY/MM/DD') + ' (YY/MM/DD)', key: 'y/m/d'},   //99/01/15
            {label: moment().format('YY-MM-DD') + ' (YY-MM-DD)', key: 'y-m-d'}   //99-01-15
        ])
        .constant('COMPARISON_TYPES_FILTER_CONNECT_NUMBER', [
            {key: 'in', label: 'In'},
            {key: 'not in', label: 'Not In'},
            {key: 'smaller', label: 'Less Than'},
            {key: 'smaller or equal', label: 'Less Than or Equal'},
            {key: 'equal', label: 'Equal'},
            {key: 'not equal', label: 'Not Equal'},
            {key: 'greater', label: 'Greater'},
            {key: 'greater or equal', label: 'Greater Than or Equal'}
        ])
        .constant('COMPARISON_TYPES_FILTER_CONNECT_TEXT', [
            {key: 'in', label: 'In'},
            {key: 'not in', label: 'Not In'},
            {key: 'contains', label: 'Contains'},
            {key: 'not contains', label: 'Does Not Contain'},
            {key: 'start with', label: 'Starts With'},
            {key: 'end with', label: 'Ends With'}
        ])

        .constant('CONNECT_DATA_SOURCE_TYPE_FORMAT_ALL_FIELD_KEY', {
            date: 'date',
            number: 'number',
            groupBy: 'groupBy',
            sortBy: 'sortBy',
            addField: 'addField',
            addCalculatedField: 'addCalculatedField',
            comparisonPercent: 'comparisonPercent',
            // addConcatenatedField: 'addConcatenatedField',
            currency: 'currency',
            replaceText: 'replaceText',
            replacePattern: 'replacePattern'
        })
        .provider('CONNECT_DATA_SOURCE_TYPE_FORMAT_ALL_FIELD', {
            $get: function (CONNECT_DATA_SOURCE_TYPE_FORMAT_ALL_FIELD_KEY) {
                return [
                    {key: CONNECT_DATA_SOURCE_TYPE_FORMAT_ALL_FIELD_KEY.date, label: 'Date Format'},
                    {key: CONNECT_DATA_SOURCE_TYPE_FORMAT_ALL_FIELD_KEY.number, label: 'Number Format'},
                    {key: CONNECT_DATA_SOURCE_TYPE_FORMAT_ALL_FIELD_KEY.groupBy, label: 'Group By'},
                    {key: CONNECT_DATA_SOURCE_TYPE_FORMAT_ALL_FIELD_KEY.sortBy, label: 'Sort By'},
                    {key: CONNECT_DATA_SOURCE_TYPE_FORMAT_ALL_FIELD_KEY.addField, label: 'Add Field'},
                    {key: CONNECT_DATA_SOURCE_TYPE_FORMAT_ALL_FIELD_KEY.addCalculatedField, label: 'Add Calculated Field'},
                    {key: CONNECT_DATA_SOURCE_TYPE_FORMAT_ALL_FIELD_KEY.comparisonPercent, label: 'Comparison Percent'},
                    // {key: CONNECT_DATA_SOURCE_TYPE_FORMAT_ALL_FIELD_KEY.addConcatenatedField, label: 'Concatenated Field'},
                    {key: CONNECT_DATA_SOURCE_TYPE_FORMAT_ALL_FIELD_KEY.replaceText, label: 'Replace Text'},
                    {key: CONNECT_DATA_SOURCE_TYPE_FORMAT_ALL_FIELD_KEY.replacePattern, label: 'Replace Pattern'}
                ];
            }
        })
        .constant('POSITIONS_FOR_REPLACE_TEXT', [
            {key: 'anywhere', label: 'Anywhere'},
            {key: 'at the beginning', label: 'At the Beginning'},
            {key: 'at the end', label: 'At the End'}
        ])
        .constant('REPORT_VIEW_INTERNAL_FIELD_VARIABLE', ['__filename', '__email_subject', '__email_body', '__email_date_time'])
    ;
})();