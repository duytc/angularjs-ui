(function () {
    'use strict';

    angular.module('tagcade.unifiedReport.connect')
        .directive('filterConnect', filterConnect)
    ;

    function filterConnect($compile, _, filterFilter, FIELD_TYPES, DATE_FORMAT_TYPES, COMPARISON_TYPES_FILTER_CONNECT_NUMBER, COMPARISON_TYPES_FILTER_CONNECT_TEXT) {
        'use strict';

        return {
            scope: {
                filters: '=',
                mapFields: '=',
                dimensionsMetrics: '=',
                dataSourceFields: '=listDataSourceFields'
            },
            restrict: 'AE',
            templateUrl: 'unifiedReport/connectDataSource/directives/filterConnect.tpl.html',
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

                    scope.addFilter = addFilter;
                    scope.removeFilter = removeFilter;
                    scope.getComparisonTypes = getComparisonTypes;
                    scope.selectType = selectType;
                    scope.getFieldNames = getFieldNames;
                    scope.selectedComparison = selectedComparison;
                    scope.addCompareValue = addCompareValue;
                    scope.onSelectFilterType = onSelectFilterType;
                    scope.onSelectFieldName = onSelectFieldName;
                    scope.filterDataSourceFields = filterDataSourceFields;
                    scope.showSelectType = showSelectType;
                    
                    function showSelectType(filter) {
                        if(!!scope.mapFields[filter.field]) {
                            if(scope.dimensionsMetrics[scope.mapFields[filter.field]] == 'date' || scope.dimensionsMetrics[scope.mapFields[filter.field]] == 'datetime') {
                                filter.type = 'date'
                            }

                            else if(scope.dimensionsMetrics[scope.mapFields[filter.field]] == 'number' || scope.dimensionsMetrics[scope.mapFields[filter.field]] == 'decimal') {
                                filter.type = 'number'
                            }

                            else {
                                filter.type = 'text';
                            }

                            return false;
                        }

                        return true
                    }

                    scope.$watch(function () {
                        return scope.mapFields;
                    }, function () {
                        filterDataSourceFields();
                    }, true);

                    function filterDataSourceFields() {
                        var dateTimeTypeMappedFields = [];
                        for (var proper in scope.mapFields) {
                            if (scope.dimensionsMetrics[scope.mapFields[proper]] == 'date' || scope.dimensionsMetrics[scope.mapFields[proper]] == 'datetime') {
                                dateTimeTypeMappedFields.push(proper);
                            }
                        }

                        return _.filter(scope.dataSourceFields, function (item) {
                            return (_.contains(dateTimeTypeMappedFields, item) == false);
                        });
                    }

                    filterDataSourceFields();

                    function onSelectFilterType(filter) {
                        if ('comparison' in filter) {
                            filter.comparison = null;
                        }

                        if ('compareValue' in filter) {
                            filter.compareValue = null;
                        }

                        if ('compareValue' in filter) {
                            filter.date = {
                                startDate: moment().startOf('day'),
                                endDate: moment().endOf('day')
                            };
                        }
                    }

                    function onSelectFieldName(filter) {
                        if ('type' in filter) {
                            filter.type = null;

                        }

                        if ('comparison' in filter) {
                            filter.comparison = null;
                        }

                        if ('compareValue' in filter) {
                            filter.compareValue = null;
                        }

                        if ('compareValue' in filter) {
                            filter.date = {
                                startDate: moment().startOf('day'),
                                endDate: moment().endOf('day')
                            };
                        }

                    }

                    function addCompareValue(query) {
                        if (!/^[+-]?\d+(\.\d+)?$/.test(query)) {
                            return;
                        }

                        return query;
                    }

                    function getFieldNames(itemField) {
                        return scope.fieldNames;
                        // return _.filter(scope.fieldNames, function (fileName) {
                        //     if(itemField == fileName) {
                        //         return true;
                        //     }
                        //
                        //     for (var index in scope.filters) {
                        //         var filter = scope.filters[index];
                        //
                        //         if(filter.field == fileName) {
                        //             return false
                        //         }
                        //     }
                        //
                        //     return true;
                        // })
                    }

                    function getComparisonTypes(type) {
                        if (type.type == 'text') {
                            return COMPARISON_TYPES_FILTER_CONNECT_TEXT;
                        }

                        if (type.type == 'number') {
                            return COMPARISON_TYPES_FILTER_CONNECT_NUMBER;
                        }

                        return []
                    }

                    // function selectField(field, filter) {
                    //     setTimeout(function () {
                    //         filter.comparison = null;
                    //
                    //         if (scope.dimensionsMetrics[field] == 'date' || scope.dimensionsMetrics[field] == 'datetime') {
                    //             filter.type = 'date'
                    //         }
                    //
                    //         if (scope.dimensionsMetrics[field] == 'number' || scope.dimensionsMetrics[field] == 'decimal') {
                    //             filter.type = 'number'
                    //         }
                    //
                    //         if (scope.dimensionsMetrics[field] == 'text' || scope.dimensionsMetrics[field] == 'multiLineText') {
                    //             filter.type = 'text'
                    //         }
                    //     }, 0);
                    // }

                    function selectType(type, filter) {
                        filter.comparison = null;
                    }

                    function selectedComparison(filter) {
                        filter.compareValue = null;
                    }

                    function addFilter() {
                        scope.filters.push({
                            field: null,
                            type: null,
                            // format: null,
                            startDate: null,
                            endDate: null,
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