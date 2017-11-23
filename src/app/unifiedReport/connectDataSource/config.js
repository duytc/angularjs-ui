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
            {label: moment().format('YYYY-MM-DD') + ' (YYYY-MM-DD)', keyForJS: 'YYYY-MM-DD', key: 'Y-m-d'},   //2016-01-15
            {label: moment().format('YYYY/MM/DD') + ' (YYYY/MM/DD)', keyForJS: 'YYYY/MM/DD', key: 'Y/m/d'},   //2016/01/15
            {label: moment().format('MM-DD-YYYY') + ' (MM-DD-YYYY)', keyForJS: 'MM-DD-YYYY', key: 'm-d-Y'},   //01-15-2016
            {label: moment().format('MM/DD/YYYY') + ' (MM/DD/YYYY)', keyForJS: 'MM/DD/YYYY', key: 'm/d/Y'},   //01/15/2016
            {label: moment().format('DD-MM-YYYY') + ' (DD-MM-YYYY)', keyForJS: 'DD-MM-YYYY', key: 'd-m-Y'},   //15-01-2016
            {label: moment().format('DD/MM/YYYY') + ' (DD/MM/YYYY)', keyForJS: 'DD/MM/YYYY', key: 'd/m/Y'},   //15/01/2016
            {label: moment().format('YYYY-MMM-DD') + ' (YYYY-MMM-DD)', keyForJS: 'YYYY-MMM-DD', key: 'Y-M-d'},   //2016-Jan-15
            {label: moment().format('YYYY/MMM/DD') + ' (YYYY/MMM/DD)', keyForJS: 'YYYY/MMM/DD', key: 'Y/M/d'},   //2016-Jan-15
            {label: moment().format('MMM-DD-YYYY') + ' (MMM-DD-YYYY)', keyForJS: 'MMM-DD-YYYY', key: 'M-d-Y'},   //Jan-15-2016
            {label: moment().format('MMM/DD/YYYY') + ' (MMM/DD/YYYY)', keyForJS: 'MMM/DD/YYYY', key: 'M/d/Y'},   //Jan/15/2016
            {label: moment().format('DD-MMM-YYYY') + ' (DD-MMM-YYYY)', keyForJS: 'DD-MMM-YYYY', key: 'd-M-Y'},   //15-Jan-2016
            {label: moment().format('DD/MMM/YYYY') + ' (DD/MMM/YYYY)', keyForJS: 'DD/MMM/YYYY', key: 'd/M/Y'},    //15/Jan/2016
            {label: moment().format('MMM DD, YYYY') + ' (MMM DD, YYYY)', keyForJS: 'MMM DD, YYYY', key: 'M d, Y'},    //Jan 15, 2016
            {label: moment().format('YYYY, MMM DD') + ' (YYYY, MMM DD)', keyForJS: 'YYYY, MMM DD', key: 'Y, M d'},    //2016, Jan 15

            /** Support 2 digit years*/
            {label: moment().format('MM/DD/YY') + ' (MM/DD/YY)', keyForJS: 'MM/DD/YY', key: 'm/d/y'},   //01/15/99
            {label: moment().format('MM-DD-YY') + ' (MM-DD-YY)', keyForJS: 'MM-DD-YY', key: 'm-d-y'},   //01-15-99
            {label: moment().format('DD/MM/YY') + ' (DD/MM/YY)', keyForJS: 'DD/MM/YY', key: 'd/m/y'},   //15/01/99
            {label: moment().format('DD-MM-YY') + ' (DD-MM-YY)', keyForJS: 'DD-MM-YY', key: 'd-m-y'},   //15-01-99
            {label: moment().format('YY/MM/DD') + ' (YY/MM/DD)', keyForJS: 'YY/MM/DD', key: 'y/m/d'},   //99/01/15
            {label: moment().format('YY-MM-DD') + ' (YY-MM-DD)', keyForJS: 'YY-MM-DD', key: 'y-m-d'}, //99-01-15

            /** Support datetime format, include hour, month, second */
            {label: moment().format('YYYY-MM-DD HH:mm:ss') + ' (YYYY-MM-DD HH:mm:ss)', keyForJS: 'YYYY-MM-DD HH:mm:ss', key: 'Y-m-d H:i:s'},
            {label: moment().format('YYYY-MM-DD HH:mm') + ' (YYYY-MM-DD HH:mm)', keyForJS: 'YYYY-MM-DD HH:mm', key: 'Y-m-d H:i'},

            {label: moment().format('YYYY-MM-DD HH:mm:ss') + ' ' + moment().format('Z') + ' (YYYY-MM-DD HH:mm:ss T)', keyForJS: 'YYYY-MM-DD HH:mm:ss T', key: 'Y-m-d H:i:s T'} // 2017-06-12 20:00:00 +00:00
        ])
        .constant('COMPARISON_TYPES_FILTER_CONNECT_NUMBER', [
            {key: 'in', label: 'In'},
            {key: 'not in', label: 'Not In'},
            {key: 'smaller', label: 'Less Than'},
            {key: 'smaller or equal', label: 'Less Than or Equals'},
            {key: 'equal', label: 'Equals'},
            {key: 'not equal', label: 'Not Equal To'},
            {key: 'greater', label: 'Greater Than'},
            {key: 'greater or equal', label: 'Greater Than or Equals'},
            {key: 'isEmpty', label: 'Is Empty'},
            {key: 'isNotEmpty', label: 'Is Not Empty'}
        ])
        .constant('COMPARISON_TYPES_FILTER_CONNECT_DECIMAL', [
            {key: 'smaller', label: 'Less Than'},
            {key: 'smaller or equal', label: 'Less Than or Equals'},
            {key: 'equal', label: 'Equals'},
            {key: 'not equal', label: 'Not Equal To'},
            {key: 'greater', label: 'Greater Than'},
            {key: 'greater or equal', label: 'Greater Than or Equals'},
            {key: 'isEmpty', label: 'Is Empty'},
            {key: 'isNotEmpty', label: 'Is Not Empty'}
        ])
        .constant('COMPARISON_TYPES_FILTER_CONNECT_TEXT', [
            {key: 'in', label: 'In'},
            {key: 'not in', label: 'Not In'},
            {key: 'contains', label: 'Contains'},
            {key: 'not contains', label: 'Does Not Contain'},
            {key: 'start with', label: 'Starts With'},
            {key: 'end with', label: 'Ends With'},
            {key: 'isEmpty', label: 'Is Empty'},
            {key: 'isNotEmpty', label: 'Is Not Empty'}
        ])
        .constant('COMPARISON_TYPES_CALCULATED_DEFAULT_VALUE', [
            {key: 'in', label: 'In'},
            {key: 'not in', label: 'Not In'},
            {key: 'smaller', label: 'Less Than'},
            {key: 'smaller or equal', label: 'Less Than or Equals'},
            {key: 'equal', label: 'Equals'},
            {key: 'not equal', label: 'Not Equal To'},
            {key: 'greater', label: 'Greater Than'},
            {key: 'greater or equal', label: 'Greater Than or Equals'},
            // {key: 'startsWith', label: 'Starts With'},
            // {key: 'endsWith', label: 'Ends With'},
            // {key: 'contain', label: 'Contain'},
            // {key: 'notContain', label: 'Not Contain'},
            {key: 'is invalid', label: 'Is Invalid'}
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
            extractPattern: 'extractPattern',
            augmentation: 'augmentation',
            subsetGroup: 'subsetGroup',
            convertCase: 'convertCase',
            normalizeText: 'normalizeText',
            addFieldFromDate: 'addFieldFromDate'
        })
        .provider('CONNECT_DATA_SOURCE_TYPE_FORMAT_ALL_FIELD', {
            $get: function (CONNECT_DATA_SOURCE_TYPE_FORMAT_ALL_FIELD_KEY) {
                return [
                    {key: CONNECT_DATA_SOURCE_TYPE_FORMAT_ALL_FIELD_KEY.date, label: 'Date Format'},
                    {key: CONNECT_DATA_SOURCE_TYPE_FORMAT_ALL_FIELD_KEY.number, label: 'Number Format'},
                    {key: CONNECT_DATA_SOURCE_TYPE_FORMAT_ALL_FIELD_KEY.groupBy, label: 'Group'},
                    {key: CONNECT_DATA_SOURCE_TYPE_FORMAT_ALL_FIELD_KEY.sortBy, label: 'Sort By'},
                    {key: CONNECT_DATA_SOURCE_TYPE_FORMAT_ALL_FIELD_KEY.addField, label: 'Add Field'},
                    {key: CONNECT_DATA_SOURCE_TYPE_FORMAT_ALL_FIELD_KEY.addCalculatedField, label: 'Add Calculated Field'},
                    {key: CONNECT_DATA_SOURCE_TYPE_FORMAT_ALL_FIELD_KEY.comparisonPercent, label: 'Comparison Percent'},
                    // {key: CONNECT_DATA_SOURCE_TYPE_FORMAT_ALL_FIELD_KEY.addConcatenatedField, label: 'Concatenated Field'},
                    {key: CONNECT_DATA_SOURCE_TYPE_FORMAT_ALL_FIELD_KEY.replaceText, label: 'Replace Text'},
                    {key: CONNECT_DATA_SOURCE_TYPE_FORMAT_ALL_FIELD_KEY.extractPattern, label: 'Extract Pattern'},
                    {key: CONNECT_DATA_SOURCE_TYPE_FORMAT_ALL_FIELD_KEY.augmentation, label: 'Data Augmentation'},
                    {key: CONNECT_DATA_SOURCE_TYPE_FORMAT_ALL_FIELD_KEY.subsetGroup, label: 'Subset Group'},
                    {key: CONNECT_DATA_SOURCE_TYPE_FORMAT_ALL_FIELD_KEY.convertCase, label: 'Convert Case'},
                    {key: CONNECT_DATA_SOURCE_TYPE_FORMAT_ALL_FIELD_KEY.normalizeText, label: 'Normalize Text'},
                    {key: CONNECT_DATA_SOURCE_TYPE_FORMAT_ALL_FIELD_KEY.addFieldFromDate, label: 'Add Field From Date'}
                ];
            }
        })
        .constant('POSITIONS_FOR_REPLACE_TEXT', [
            {key: 'anywhere', label: 'Anywhere'},
            {key: 'at the beginning', label: 'At the Beginning'},
            {key: 'at the end', label: 'At the End'}
        ])
        .constant('CONVERT_CASE_TYPES', [
            {key: 'lowerCase', label: 'Lower Case'},
            {key: 'upperCase', label: 'Upper Case'}
        ])
        .constant('REPORT_VIEW_INTERNAL_FIELD_VARIABLE', [
            {
                key: '__filename',
                label: '__filename',
                original: '__filename'
            },
            {
                key: '__email_subject',
                label: '__email_subject',
                original: '__email_subject'
            },
            {
                key: '__email_body',
                label: '__email_body',
                original: '__email_body'
            },
            {
                key: '__email_date_time',
                label: '__email_date_time',
                original: '__email_date_time'
            },
            {
                key: '__date',
                label: '__date',
                original: '__date'
            }
        ])
        .constant('CONNECT_TIMEZONES', [
            {key: 'UTC', label: 'UTC'},
            {key: 'EST5EDT', label: 'EST'},
            {key: 'CST6CDT', label: 'CST'},
            {key: 'PST8PDT', label: ' PST'}
        ])
    ;
})();