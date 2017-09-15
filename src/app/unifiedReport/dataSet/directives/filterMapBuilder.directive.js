(function () {
    'use strict';

    angular.module('tagcade.unifiedReport.dataSet')
        .directive('filterMapBuilder', filterMapBuilder)
    ;

    function filterMapBuilder($compile, $filter, COMPARISON_TYPES_FILTER_CONNECT_NUMBER, COMPARISON_TYPES_FILTER_CONNECT_TEXT) {
        'use strict';

        return {
            scope: {
                filters: '=',
                fields: '=',
                fieldTypes: '='
            },
            restrict: 'AE',
            templateUrl: 'unifiedReport/dataSet/directives/filterMapBuilder.tpl.html',
            compile: function (element, attrs) {
                var content, directive;
                content = element.contents().remove();
                return function (scope, element, attrs) {
                    scope.dataFields = $filter('filter')(scope.fields, function (field) {
                        return field.key != '__is_mapped' && !!field.label
                    });

                    scope.dateTypes = [
                        {key: 'Fixed Date Range', value: 'customRange'},
                        {key: 'Dynamic', value: 'dynamic'}
                    ];

                    scope.dynamicDatePickerOpts = [
                        {key: 'Today', value: 'today'},
                        {key: 'Yesterday', value: 'yesterday'},
                        {key: 'Last 7 Days', value: 'last 7 days'},
                        {key: 'Last 30 Days', value: 'last 30 days'},
                        {key: 'This Month', value: 'this month'},
                        {key: 'Last Month', value: 'last month'}
                    ];

                    scope.datePickerOpts = {
                        maxDate:  moment().endOf('day'),
                        ranges: {
                            'Today': [moment().startOf('day'), moment().endOf('day')],
                            'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                            'Last 7 Days': [moment().subtract(7, 'days'), moment().subtract(1, 'days')],
                            'Last 30 Days': [moment().subtract(30, 'days'), moment().subtract(1, 'days')],
                            'This Month': [moment().startOf('month'), moment().endOf('month')],
                            'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                        }
                    };

                    scope.addFilter = addFilter;
                    scope.removeFilter = removeFilter;
                    scope.selectField = selectField;
                    scope.selectDateType = selectDateType;
                    scope.selectedComparison = selectedComparison;
                    scope.addCompareValue = addCompareValue;
                    scope.getComparisonTypes = getComparisonTypes;

                    function getComparisonTypes(type) {
                        if(type.type == 'text') {
                            return COMPARISON_TYPES_FILTER_CONNECT_TEXT;
                        }

                        if(type.type == 'number') {
                            return COMPARISON_TYPES_FILTER_CONNECT_NUMBER;
                        }

                        return []
                    }

                    function addCompareValue(query) {
                        if (!/^[+-]?\d+(\.\d+)?$/.test(query)) {
                            return;
                        }

                        return query;
                    }

                    function selectedComparison (filter) {
                        filter.compareValue = null;
                        filter.compareValue = null;
                    }

                    function selectDateType(dateType, filter) {
                        if(dateType.value == 'customRange' || dateType.value == 'userProvided') {
                            filter.dateValue = {
                                startDate: moment().startOf('day'),
                                endDate: moment().endOf('day')
                            }
                        } else {
                            filter.dateValue = null;
                        }
                    }

                    function selectField(field, filter) {
                        if(scope.fieldTypes[field] == 'date' || scope.fieldTypes[field] == 'datetime') {
                            filter.type = 'date';
                            filter.userProvided = false;
                        }

                        if(scope.fieldTypes[field] == 'number' || scope.fieldTypes[field] == 'decimal') {
                            filter.type = 'number'
                        }

                        if(scope.fieldTypes[field] == 'text' || scope.fieldTypes[field] == 'largeText') {
                            filter.type = 'text'
                        }

                        filter.comparison = null;
                    }

                    function addFilter() {
                        scope.filters.push({
                            field: null,
                            comparison: null,
                            compareValue: null,
                            type: null,
                            // startDate: null,
                            // endDate: null,
                            date: {
                                startDate: moment().startOf('day'),
                                endDate: moment().endOf('day')
                            }
                        });
                    }

                    function removeFilter(index) {
                        scope.filters.splice(index, 1);
                    }

                    directive || (directive = $compile(content));

                    element.append(directive(scope, function ($compile) {
                        return $compile;
                    }));
                }
            }
        };
    }
})();