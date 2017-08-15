(function () {
    'use strict';

    angular.module('tagcade.unifiedReport.report')
        .directive('filterReportView', filterReportView)
    ;

    function filterReportView($compile, _, FIELD_TYPES, DATE_FORMAT_TYPES, COMPARISON_TYPES_FILTER_CONNECT_NUMBER, COMPARISON_TYPES_FILTER_CONNECT_DECIMAL, COMPARISON_TYPES_FILTER_CONNECT_TEXT) {
        'use strict';

        return {
            scope: {
                filters: '=',
                mapFields: '=',
                dimensionsMetrics: '='
            },
            restrict: 'AE',
            templateUrl: 'unifiedReport/report/directives/filterReportView.tpl.html',
            compile: function (element, attrs) {
                var content, directive;
                content = element.contents().remove();
                return function (scope, element, attrs) {
                    scope.fieldTypes = FIELD_TYPES;
                    scope.dateFormatTypes = DATE_FORMAT_TYPES;

                    scope.fieldNames = _.isArray(scope.mapFields) ? scope.mapFields : _.union(_.values(scope.mapFields));

                    scope.$watch(function () {
                        return scope.mapFields;
                    }, function () {
                        scope.fieldNames = _.isArray(scope.mapFields) ? scope.mapFields : _.union(_.values(scope.mapFields));
                    }, true);

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

                    scope.dateTypes = [
                        {key: 'Fixed Date Range', value: 'customRange'},
                        {key: 'Dynamic', value: 'dynamic'},
                        // {key: 'User Provided', value: 'userProvided'}
                    ];

                    scope.dynamicDatePickerOpts = [
                        {key: 'Today', value: 'today'},
                        {key: 'Yesterday', value: 'yesterday'},
                        {key: 'Last 7 Days', value: 'last 7 days'},
                        {key: 'Last 30 Days', value: 'last 30 days'},
                        {key: 'This Month', value: 'this month'},
                        {key: 'Last Month', value: 'last month'}
                    ];

                    scope.addFilter = addFilter;
                    scope.removeFilter = removeFilter;
                    scope.selectField = selectField;
                    scope.getComparisonTypes = getComparisonTypes;
                    scope.selectType = selectType;
                    scope.getFieldNames = getFieldNames;
                    scope.selectedComparison = selectedComparison;
                    scope.addCompareValue = addCompareValue;
                    scope.selectDateType = selectDateType;
                    scope.addCompareValueText = addCompareValueText;

                    function addCompareValueText(query) {
                        if (/['`$]/.test(query)) {
                            return;
                        }

                        return query;
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

                    function getFieldNames(itemField) {
                        return scope.fieldNames
                    }
                    
                    function getComparisonTypes(type, field) {
                        if (type.type == 'text') {
                            return COMPARISON_TYPES_FILTER_CONNECT_TEXT;
                        }

                        if(type.type == 'number') {
                            var findField = _.find(scope.dimensionsMetrics, function (dm) {
                                return dm.key == field;
                            });

                            if (!!findField && findField.type == 'decimal') {
                                return COMPARISON_TYPES_FILTER_CONNECT_DECIMAL;
                            }

                            return COMPARISON_TYPES_FILTER_CONNECT_NUMBER;
                        }

                        return []
                    }
                    
                    function selectField(field, filter) {
                        filter.comparison = null;

                        var findField = _.find(scope.dimensionsMetrics, function (dm) {
                            return dm.key == field.key;
                        });

                        if(!findField) {
                            return;
                        }

                        if(findField.type == 'date' || findField.type == 'datetime') {
                            filter.type = 'date';
                            filter.userProvided = true;
                        }

                        if(findField.type == 'number' || findField.type == 'decimal') {
                            filter.type = 'number'
                        }

                        if(findField.type == 'text' || findField.type == 'largeText') {
                            filter.type = 'text'
                        }

                        filter.comparison = null;
                    }

                    function selectedComparison (filter) {
                        filter.compareValue = null;
                        filter.compareValue = null;
                    }

                    function selectType(type, filter) {
                        filter.comparison = null;
                    }

                    function addCompareValue(query) {
                        if (!/^[+-]?\d+(\.\d+)?$/.test(query)) {
                            return;
                        }

                        return query;
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

                    element.append(directive(scope, function ($compile) {
                        return $compile;
                    }));
                }
            }
        };
    }
})();