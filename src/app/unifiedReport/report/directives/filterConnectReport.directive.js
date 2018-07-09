(function() {
    'use strict';

    angular.module('tagcade.unifiedReport.report')
        .directive('filterConnectReport', filterConnectReport);

    function filterConnectReport($compile, $filter, _, FIELD_TYPES, DATE_FORMAT_TYPES, COMPARISON_TYPES_FILTER_CONNECT_NUMBER, COMPARISON_TYPES_FILTER_CONNECT_DECIMAL, COMPARISON_TYPES_FILTER_CONNECT_TEXT) {
        'use strict';

        return {
            scope: {
                filters: '=',
                mapFields: '=',
                dimensionsMetrics: '=',
                disabled: "="
            },
            restrict: 'AE',
            templateUrl: 'unifiedReport/report/directives/filterConnectReport.tpl.html',
            compile: function(element, attrs) {
                var content, directive;
                content = element.contents().remove();
                return function(scope, element, attrs) {
                    scope.fieldTypes = FIELD_TYPES;
                    scope.dateFormatTypes = DATE_FORMAT_TYPES;

                    scope.fieldNames = _.isArray(scope.mapFields) ? scope.mapFields : _.union(_.values(scope.mapFields));

                    scope.$watch(function() {
                        return scope.mapFields;
                    }, function() {
                        scope.fieldNames = _.isArray(scope.mapFields) ? scope.mapFields : _.union(_.values(scope.mapFields));
                    }, true);

                    scope.datePickerOpts = {
                        maxDate: moment().endOf('day'),
                        ranges: {
                            'Today': [moment().startOf('day'), moment().endOf('day')],
                            'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                            'Last 7 Days': [moment().subtract(7, 'days'), moment().subtract(1, 'days')],
                            'Last 30 Days': [moment().subtract(30, 'days'), moment().subtract(1, 'days')],
                            'This Month': [moment().startOf('month'), moment().endOf('month')],
                            'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                        }
                    };

                    scope.dynamicDatePickerOpts = [
                        {key: 'Today', value: 'today'},
                        {key: 'Yesterday', value: 'yesterday'},
                        {key: 'Last 7 Days', value: 'last 7 days'},
                        {key: 'Last 30 Days', value: 'last 30 days'},
                        {key: 'This Month', value: 'this month'},
                        {key: 'Last Month', value: 'last month'}
                    ];

                    scope.dateTypes = [
                        {key: 'Fixed Date Range', value: 'customRange'},
                        {key: 'Dynamic', value: 'dynamic'},
                        // {key: 'User Provided', value: 'userProvided'}
                    ];

                    scope.addFilter = addFilter;
                    scope.removeFilter = removeFilter;
                    scope.selectField = selectField;
                    scope.getComparisonTypes = getComparisonTypes;
                    scope.selectType = selectType;
                    scope.getFieldNames = getFieldNames;
                    scope.selectedComparison = selectedComparison;
                    scope.addCompareValue = addCompareValue;
                    scope.addCompareValueText = addCompareValueText;
                    scope.selectDateType = selectDateType;

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

                    function addCompareValue(query) {
                        if (!/^[+-]?\d+(\.\d+)?$/.test(query)) {
                            return;
                        }

                        return query;
                    }

                    function addCompareValueText(query) {
                        if (/['`$]/.test(query)) {
                            return;
                        }

                        return query;
                    }

                    function getFieldNames(itemField, filters) {
                        return $filter('filter')(scope.fieldNames, function (field) {
                            if(scope.dimensionsMetrics[field] != 'date' && scope.dimensionsMetrics[field] != 'datetime') {
                                return true
                            }

                            if(itemField == field) {
                                return true
                            }

                            for(var index in filters) {
                                var filter = filters[index];

                                if(filter.field == field) {
                                    return false
                                }
                            }

                            return true
                        })
                    }

                    function getComparisonTypes(type, field) {
                        if (type.type == 'text') {
                            return COMPARISON_TYPES_FILTER_CONNECT_TEXT;
                        }

                        if(type.type == 'number') {
                            if (scope.dimensionsMetrics[field] == 'decimal') {
                                return COMPARISON_TYPES_FILTER_CONNECT_DECIMAL;
                            }

                            return COMPARISON_TYPES_FILTER_CONNECT_NUMBER;
                        }

                        return []
                    }

                    function selectField(field, filter) {
                        setTimeout(function () {
                            filter.comparison = null;

                            if (scope.dimensionsMetrics[field] == 'date' || scope.dimensionsMetrics[field] == 'datetime') {
                                filter.type = 'date';
                                filter.userProvided = true;
                            }

                            if (scope.dimensionsMetrics[field] == 'number' || scope.dimensionsMetrics[field] == 'decimal') {
                                filter.type = 'number';
                                filter.userProvided = false;
                            }

                            if (scope.dimensionsMetrics[field] == 'text' || scope.dimensionsMetrics[field] == 'largeText') {
                                filter.type = 'text';
                                filter.userProvided = false;
                            }
                        }, 0);
                    }

                    function selectType(type, filter) {
                        filter.comparison = null;
                    }

                    function selectedComparison(filter) {
                        filter.compareValue = null;
                        /*setTimeout(function () {
                            filter.compareValue = [];
                        }, 0);*/
                    }

                    function addFilter() {
                        scope.filters.push({
                            field: null,
                            type: null,
                            format: null,
                            dateValue: {
                                startDate: moment().startOf('day'),
                                endDate: moment().endOf('day')
                            }
                        });
                    }

                    function removeFilter(index) {
                        scope.filters.splice(index, 1);
                    }

                    directive || (directive = $compile(content));

                    element.append(directive(scope, function($compile) {
                        return $compile;
                    }));
                }
            }
        };
    }
})();