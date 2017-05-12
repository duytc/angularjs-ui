(function () {
    'use strict';

    angular.module('tagcade.unifiedReport.connect')
        .directive('filterConnect', filterConnect)
    ;

    function filterConnect($compile, _, connectedDataSourceService, FIELD_TYPES, DATE_FORMAT_TYPES, COMPARISON_TYPES_FILTER_CONNECT_NUMBER, COMPARISON_TYPES_FILTER_CONNECT_TEXT) {
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

                    scope.dataSourceFields = connectedDataSourceService.inputFormatDataSourceField(scope.dataSourceFields);

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
                    scope.selectedComparison = selectedComparison;
                    scope.addCompareValue = addCompareValue;
                    scope.onSelectFilterType = onSelectFilterType;
                    scope.onSelectFieldName = onSelectFieldName;
                    scope.showSelectType = showSelectType;
                    
                    function showSelectType(filter) {
                        var item = _.find(scope.dataSourceFields, function (item) {
                            return item.key == filter.field
                        });

                        if(!!item && !!scope.mapFields[item.original]) {
                            if(scope.dimensionsMetrics[scope.mapFields[item.original]] == 'date' || scope.dimensionsMetrics[scope.mapFields[item.original]] == 'datetime') {
                                filter.type = 'date'
                            }

                            else if(scope.dimensionsMetrics[scope.mapFields[item.original]] == 'number' || scope.dimensionsMetrics[scope.mapFields[item.original]] == 'decimal') {
                                filter.type = 'number'
                            }

                            else {
                                filter.type = 'text';
                            }

                            return false;
                        }

                        return true
                    }

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

                    function getComparisonTypes(type) {
                        if (type.type == 'text') {
                            return COMPARISON_TYPES_FILTER_CONNECT_TEXT;
                        }

                        if (type.type == 'number') {
                            return COMPARISON_TYPES_FILTER_CONNECT_NUMBER;
                        }

                        return []
                    }

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