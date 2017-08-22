(function () {
    'use strict';
    angular.module('tagcade.unifiedReport.report')
        .constant('REPORT_BUILDER_ALL_FIELD_TRANSFORMS_KEYS', {
            date: 'date',
            number: 'number',
            percentage: 'percentage',
            groupBy: 'groupBy',
            sortBy: 'sortBy',
            addField: 'addField',
            addCalculatedField: 'addCalculatedField',
            comparisonPercent: 'comparisonPercent',
            currency: 'currency',
            columnPosition: 'columnPosition',
            replaceText: 'replaceText'
        })
        .provider('REPORT_BUILDER_TRANSFORMS_ALL_FIELD_TYPES', {
            $get: function (REPORT_BUILDER_ALL_FIELD_TRANSFORMS_KEYS) {
                return [
                    {key: REPORT_BUILDER_ALL_FIELD_TRANSFORMS_KEYS.groupBy, label: 'Group By'},
                    {key: REPORT_BUILDER_ALL_FIELD_TRANSFORMS_KEYS.sortBy, label: 'Sort By'},
                    {key: REPORT_BUILDER_ALL_FIELD_TRANSFORMS_KEYS.addField, label: 'Add Field'},
                    {key: REPORT_BUILDER_ALL_FIELD_TRANSFORMS_KEYS.addCalculatedField, label: 'Add Calculated Field'},
                    {key: REPORT_BUILDER_ALL_FIELD_TRANSFORMS_KEYS.comparisonPercent, label: 'Comparison Percent'},
                    {key: REPORT_BUILDER_ALL_FIELD_TRANSFORMS_KEYS.replaceText, label: 'Replace Text'}
                ]
            }
        })
        .provider('REPORT_BUILDER_FORMAT_ALL_FIELD_TYPES', {
            $get: function (REPORT_BUILDER_ALL_FIELD_TRANSFORMS_KEYS) {
                return [
                    {key: REPORT_BUILDER_ALL_FIELD_TRANSFORMS_KEYS.date, label: 'Date Format'},
                    {key: REPORT_BUILDER_ALL_FIELD_TRANSFORMS_KEYS.number, label: 'Number Format'},
                    {key: REPORT_BUILDER_ALL_FIELD_TRANSFORMS_KEYS.percentage, label: 'Percentage Format'},
                    {key: REPORT_BUILDER_ALL_FIELD_TRANSFORMS_KEYS.currency, label: 'Currency Format'},
                    {key: REPORT_BUILDER_ALL_FIELD_TRANSFORMS_KEYS.columnPosition, label: 'Column Position'}
                ]
            }
        })
        .provider('API_PERFORMANCE_UNIFIED_REPORTS_BASE_URL', {
            $get: function (API_UNIFIED_BASE_URL) {
                return API_UNIFIED_BASE_URL + '/reportview';
            }
        })
        .constant('COMPARISON_TYPES_ADD_FIELD_VALUE', [
            {key: 'in', label: 'In'},
            {key: 'not in', label: 'Not In'},
            {key: 'contain', label: 'Contain'},
            {key: 'not contain', label: 'Does Not Contain'},
            {key: 'smaller', label: 'Less Than'},
            {key: 'smaller or equal', label: 'Less Than or Equals'},
            {key: 'equal', label: 'Equals'},
            {key: 'not equal', label: 'Not Equal To'},
            {key: 'greater', label: 'Greater Than'},
            {key: 'greater or equal', label: 'Greater Than or Equals'},
            {key: 'between', label: 'Between'}
        ])
})();
