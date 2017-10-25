(function () {
    'use strict';

    angular.module('tagcade.unifiedReport.report')
        .directive('reportBuilderFormat', reportBuilderFormat)
    ;

    function reportBuilderFormat($compile, $filter, _, REPORT_BUILDER_FORMAT_ALL_FIELD_TYPES, CONNECT_DATA_SOURCE_TYPE_FORMAT_ALL_FIELD_KEY, DATE_FORMAT_TYPES) {
        'use strict';

        return {
            scope: {
                formats: '=',
                dateFields: '=',
                numberFields: '=',
                selectedFields: '=',
                disabled: '='
            },
            restrict: 'AE',
            templateUrl: 'unifiedReport/report/directives/reportBuilderFormat.tpl.html',
            compile: function (element, attrs) {
                var content, directive;
                content = element.contents().remove();
                return function (scope, element, attrs) {
                    scope.allFiledFormatTypes = REPORT_BUILDER_FORMAT_ALL_FIELD_TYPES;
                    scope.allFiledFormatTypeKeys = CONNECT_DATA_SOURCE_TYPE_FORMAT_ALL_FIELD_KEY;
                    scope.dateFormatTypes = DATE_FORMAT_TYPES;
                    var filterField = false;
                    var fieldForColumnPosition = [];

                    scope.sortableGroupOptions = {
                        placeholder: 'sortable-placeholder-ui-select',
                        stop: function () {
                        }
                    };

                    scope.currencies = [{
                        label: '$',
                        key: '$'
                    }];

                    scope.separatorType = [
                        {key: ',', label: 'Comma'},
                        {key: 'none', label: 'None'}
                    ];

                    scope.fieldNames = scope.selectedFields;

                    scope.$watch(function () {
                        return scope.selectedFields;
                    }, function () {
                        _updateFieldForColumnPosition();

                        scope.fieldNames = scope.selectedFields;
                    }, true);

                    function _updateFieldForColumnPosition() {
                        fieldForColumnPosition = $filter('filter')(scope.selectedFields, function (field) {
                            if(!!field && !!field.key && field.key.indexOf('__') == -1 && (field.key.indexOf('_day') == -1 || field.key.indexOf('_month') == -1 || field.key.indexOf('_year') == -1)) {
                                return true
                            }

                            return false
                        });
                    }

                    scope.allFiledFormatTypesCopy = angular.copy(scope.allFiledFormatTypes);
                    scope.removeFormat = removeFormat;
                    scope.addFormat = addFormat;
                    scope.selectedFormat = selectedFormat;
                    scope.filterFieldFormat = filterFieldFormat;
                    scope.resetDateFields = resetDateFields;
                    scope.resetNumberFields = resetNumberFields;
                    scope.resetCurrencyFields = resetCurrencyFields;
                    scope.resetSelectedFields = resetSelectedFields;
                    
                    function resetSelectedFields(formatFields) {
                        if (!filterField) {
                            return fieldForColumnPosition
                        }

                        var data = [];

                        for (var index in fieldForColumnPosition) {
                            if (angular.isArray(formatFields) && formatFields.indexOf(fieldForColumnPosition[index].key) == -1) {
                                data.push(fieldForColumnPosition[index])
                            }
                        }

                        return data
                    }

                    function filterListFormats() {
                        var columnPositionElement = null,
                            index = -1;

                        scope.allFiledFormatTypesCopy = angular.copy(scope.allFiledFormatTypes);

                        if (0 == scope.formats.length) {
                            return scope.allFiledFormatTypesCopy;
                        }

                        angular.forEach(scope.formats, function (format) {
                            if (format.type == 'columnPosition') {
                                columnPositionElement = _.find(scope.allFiledFormatTypesCopy, function (element) {
                                    return (element.key == 'columnPosition')
                                });
                            }
                        });

                        if (_.isObject(columnPositionElement)) {
                            index = scope.allFiledFormatTypesCopy.indexOf(columnPositionElement);
                            scope.allFiledFormatTypesCopy.splice(index, 1);
                        }


                        return scope.allFiledFormatTypesCopy;
                    }

                    function resetDateFields(formatFields) {
                        if (!filterField) {
                            return scope.dateFields
                        }

                        var data = [];

                        for (var index in scope.dateFields) {
                            // not select field have type is date in add field
                            if (angular.isArray(formatFields) && formatFields.indexOf(scope.dateFields[index].key) == -1 && scope.dateFields[index].transformType != 'addField' && scope.dateFields[index].transformType != 'addConditionValue') {
                                data.push(scope.dateFields[index])
                            }
                        }

                        return data
                    }

                    function resetNumberFields(formatFields) {
                        if (!filterField) {
                            return scope.numberFields
                        }

                        var data = [];

                        for (var index in scope.numberFields) {
                            if (angular.isArray(formatFields) && formatFields.indexOf(scope.numberFields[index].key) == -1) {
                                data.push(scope.numberFields[index])
                            }
                        }

                        return data
                    }

                    function resetCurrencyFields(formatFields) {
                        if (!filterField) {
                            return scope.numberFields
                        }

                        var data = [];

                        for (var index in scope.numberFields) {
                            if (formatFields.indexOf(scope.numberFields[index].key) == -1) {
                                data.push(scope.numberFields[index])
                            }
                        }

                        return data
                    }

                    function filterFieldFormat(fields, type) {
                        return function (field) {
                            for (var index in scope.formats) {
                                var format = scope.formats[index];

                                if (format.type == type) {
                                    if (!angular.isObject(format) || !angular.isArray(format.fields)) {
                                        return false;
                                    }

                                    if (format.fields.indexOf(field.key) > -1 && fields.indexOf(field.key) == -1) {
                                        return false
                                    }
                                }
                            }

                            return true;
                        }
                    }

                    function removeFormat(index) {
                        scope.formats.splice(index, 1);
                        filterListFormats();
                    }

                    function addFormat() {
                        scope.formats.push({
                            type: null
                        });
                        filterListFormats();
                    }

                    function selectedFormat(format, type) {
                        format.fields = [];

                        if (type.key == 'currency') {
                            format.currency = '$';
                        }

                        if (type.key == 'date') {
                            format.format = 'Y-m-d';
                        }

                        if (type.key == 'number') {
                            format.thousandsSeparator = ',';
                            format.decimals = 0;
                        }

                        if (type.key == 'percentage') {
                            format.precision = 2;
                        }

                        if (type.key == 'columnPosition') {
                            filterListFormats();
                        }
                    }

                    // allow filter field
                    setTimeout(function () {
                        filterField = true;
                    }, 0);

                    directive || (directive = $compile(content));

                    element.append(directive(scope, function ($compile) {
                        return $compile;
                    }));
                }
            }
        };
    }
})();