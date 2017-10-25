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
            addConditionValue: 'addConditionValue'
            // replaceText: 'replaceText',
            // postAggregation: 'postAggregation'
        })
        .provider('REPORT_BUILDER_TRANSFORMS_ALL_FIELD_TYPES', {
            $get: function (REPORT_BUILDER_ALL_FIELD_TRANSFORMS_KEYS) {
                return [
                    {key: REPORT_BUILDER_ALL_FIELD_TRANSFORMS_KEYS.groupBy, label: 'Group By'},
                    {key: REPORT_BUILDER_ALL_FIELD_TRANSFORMS_KEYS.sortBy, label: 'Sort By'},
                    {key: REPORT_BUILDER_ALL_FIELD_TRANSFORMS_KEYS.addField, label: 'Add Field'},
                    {key: REPORT_BUILDER_ALL_FIELD_TRANSFORMS_KEYS.addCalculatedField, label: 'Add Calculated Field'},
                    {key: REPORT_BUILDER_ALL_FIELD_TRANSFORMS_KEYS.comparisonPercent, label: 'Comparison Percent'},
                    {key: REPORT_BUILDER_ALL_FIELD_TRANSFORMS_KEYS.addConditionValue, label: 'Add Conditional Value'}
                    // {key: REPORT_BUILDER_ALL_FIELD_TRANSFORMS_KEYS.replaceText, label: 'Replace Text'},
                    // {key: REPORT_BUILDER_ALL_FIELD_TRANSFORMS_KEYS.postAggregation, label: 'Post Group By'}
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
            {key: 'in', label: 'In', types: ['number', 'decimal', 'text', 'date']},
            {key: 'not in', label: 'Not In', types: ['number', 'decimal', 'text', 'date']},
            {key: 'contain', label: 'Contains', types: ['text']},
            {key: 'not contain', label: 'Does Not Contain', types: ['text']},
            {key: 'smaller', label: 'Less Than', types: ['number', 'decimal']},
            {key: 'smaller or equal', label: 'Less Than or Equals', types: ['number', 'decimal']},
            {key: 'equal', label: 'Equals', types: ['number', 'decimal', 'date']},
            {key: 'not equal', label: 'Not Equal To', types: ['number', 'decimal', 'date']},
            {key: 'greater', label: 'Greater Than', types: ['number', 'decimal']},
            {key: 'greater or equal', label: 'Greater Than or Equals', types: ['number', 'decimal']},
            {key: 'between', label: 'Between', types: ['date']}
        ])
})();
