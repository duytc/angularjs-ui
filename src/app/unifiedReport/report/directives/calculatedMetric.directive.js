(function () {
    'use strict';

    angular.module('tagcade.unifiedReport.report')
        .directive('calculatedMetric', calculatedMetric)
    ;

    function calculatedMetric($compile, $modal, _, AddCalculatedField, CONNECT_TIMEZONES, COMPARISON_TYPES_ADD_FIELD_VALUE, COMPARISON_TYPES_CALCULATED_DEFAULT_VALUE, REPORT_BUILDER_TRANSFORMS_ALL_FIELD_TYPES, POSITIONS_FOR_REPLACE_TEXT, REPORT_BUILDER_ALL_FIELD_TRANSFORMS_KEYS, DATE_FORMAT_TYPES, METRICS_SET, EXCHANGE_RATES, CALCULATED_METRIC_TYPE, BUILD_IN_DATE_TIME_MACROS) {
        'use strict';

        return {
            scope: {
                calculatedMetrics: '=',
                selectedFields: '=',
                totalDimensionsMetrics: '=',
                dimensionsMetrics: '=',
                dimensionsList: '=',
                selectedFieldsDateSet: '=',
                reportBuilder: '=',
                numberFields: '=',
                disabled: '=',
                fieldsHaveDateType: '='
            },
            restrict: 'AE',
            templateUrl: 'unifiedReport/report/directives/calculatedMetric.tpl.html',
            compile: function (element, attrs) {
                var content, directive;
                content = element.contents().remove();
                return function (scope, element, attrs) {
                    scope.allFiledFormatTypes = REPORT_BUILDER_TRANSFORMS_ALL_FIELD_TYPES;
                    scope.allFiledFormatTypeKeys = REPORT_BUILDER_ALL_FIELD_TRANSFORMS_KEYS;
                    scope.dateFormatTypes = DATE_FORMAT_TYPES;
                    scope.typesField = METRICS_SET;
                    scope.positionsForReplaceText = POSITIONS_FOR_REPLACE_TEXT;
                    scope.selectAllDimensions = false;
                    scope.calculatedMetricExressionType = CALCULATED_METRIC_TYPE;
                    scope.buildInDateTimeMacros = BUILD_IN_DATE_TIME_MACROS;

                    var totalDimensionsMetricsForDefaultValues = [];

                    scope.calculatedMetricType = [
                        {key: 'number', label: 'Number'},
                        {key: 'decimal', label: 'Decimal'}
                    ];

                    scope.fieldsCalculatedField = [];
                    scope.buildInMacros = [];
                    scope.fieldNames = scope.selectedFields;

                    scope.$watch(function () {
                        return scope.selectedFields;
                    }, function () {
                        scope.fieldNames = scope.selectedFields;
                        selectTypeCalculatedField('number');
                    }, true);

                    scope.$watch(function () {
                        return scope.reportBuilder.showInTotal;
                    }, function () {
                        manageShowTotalFieldInCalculatedFieldList();
                    }, true);

                    scope.$watch(function () {
                        return scope.selectedFieldsDateSet;
                    }, function () {
                        totalDimensionsMetricsForDefaultValues = angular.copy(scope.selectedFieldsDateSet);
                        totalDimensionsMetricsForDefaultValues.unshift({
                            key: '$$CALCULATED_VALUE$$',
                            label: 'calculated value'
                        });
                    }, true);

                    scope.sortableOptions = {
                        disabled: false,
                        forcePlaceholderSize: true,
                        placeholder: 'sortable-placeholder'
                    };

                    scope.sortableDefaultValueOptions = {
                        disabled: false,
                        forcePlaceholderSize: true,
                        placeholder: 'sortable-placeholder'
                    };

                    if (scope.reorderDefaultValueAllowed) {
                        scope.sortableDefaultValueOptions['disabled'] = false;
                    } else {
                        scope.sortableDefaultValueOptions['disabled'] = true;
                    }

                    scope.patternForAddField = /^[a-zA-Z_][a-zA-Z0-9_$\s]*$/;

                    scope.removeCalculatedMetric = removeCalculatedMetric;
                    scope.addCalculatedMetric = addCalculatedMetric;
                    scope.isExpressionType = isExpressionType;
                    scope.getFieldNames = getFieldNames;
                    scope.getTypesFieldNumber = getTypesFieldNumber;
                    scope.addSpaceBeforeAndAfterOperator = addSpaceBeforeAndAfterOperator;
                    scope.getTypesFieldForCalculatedField = getTypesFieldForCalculatedField;
                    scope.formatExpressionToHighlight = formatExpressionToHighlight;
                    scope.filterFieldByText = filterFieldByText;
                    scope.enableDragDropQueryBuilder = enableDragDropQueryBuilder;
                    scope.getCalculatedMetricName = getCalculatedMetricName;
                    scope.fieldIsDatetime = fieldIsDatetime;
                    scope.selectTypeCalculatedField = selectTypeCalculatedField;
                    scope.addThisFieldToSelectedList = addThisFieldToSelectedList;
                    scope.unValidName = unValidName;

                    function selectTypeCalculatedField(type, calculatedField) {
                        scope.fieldsCalculatedField = [];
                        if (!type) {
                            return
                        }

                        //Get fields in dimension and metric of data set
                        if (type == 'number' || type == 'decimal' || type.key == 'number' || type.key == 'decimal') {
                            angular.forEach(scope.totalDimensionsMetrics, function (field) {
                                if (field.type == 'number' || field.type == 'decimal') {
                                    scope.fieldsCalculatedField.push(field)
                                }
                            });

                        } else {
                            scope.fieldsCalculatedField = scope.totalDimensionsMetrics;
                        }

                        //Get fields in add field transform
                        angular.forEach(scope.transforms, function (transform) {
                            if (transform.type == scope.allFiledFormatTypeKeys.addField || transform.type == scope.allFiledFormatTypeKeys.addConditionValue) {
                                angular.forEach(transform.fields, function (field) {
                                    if ((field.type == 'number' || field.type == 'decimal') && _.findIndex(scope.fieldsCalculatedField, {key: field.field}) == -1) {
                                        scope.fieldsCalculatedField.push({
                                            key: field.field,
                                            label: field.field,
                                            root: field.field,
                                            type: field.type
                                        });
                                    }
                                });
                            }

                            //Get fields in previous calculated field
                            if (transform.type == scope.allFiledFormatTypeKeys.addCalculatedField) {
                                angular.forEach(transform.fields, function (field) {
                                    if (!!field.field && _.findIndex(scope.fieldsCalculatedField, {key: field.field}) == -1) {
                                        scope.fieldsCalculatedField.push({
                                            key: field.key,
                                            label: field.field,
                                            root: field.field,
                                            type: field.type
                                        });
                                    }
                                })
                            }
                        });

                        angular.forEach(scope.calculatedMetrics, function (calculatedMetric) {
                            if (!!calculatedMetric.field && _.findIndex(scope.fieldsCalculatedField, {key: calculatedMetric.field}) == -1) {
                                scope.fieldsCalculatedField.push({
                                    key: calculatedMetric.field,
                                    label: calculatedMetric.field,
                                    root: calculatedMetric.field,
                                    type: calculatedMetric.type
                                });
                            }
                        });
                        return scope.fieldsCalculatedField;
                    }

                    function addThisFieldToSelectedList(calculatedField) {
                        var element = _.find(scope.fieldsCalculatedField, function (oneField) {
                            return (oneField.label == calculatedField.field);
                        });

                        if (_.isUndefined(element)) {
                            scope.fieldsCalculatedField.push({
                                key: calculatedField.field,
                                label: calculatedField.field,
                                root: calculatedField.field,
                                type: calculatedField.type
                            });
                        }

                        calculatedField.displayName =  calculatedField.field;
                    }

                    function manageShowTotalFieldInCalculatedFieldList() {
                        //Add field in show in total
                        var aliasShowTotalName = _getFieldsInShowInTotal();
                        angular.forEach(aliasShowTotalName, function (oneObject) {
                            var element = _.find(scope.fieldsCalculatedField, function (calculatedField) {
                                return (calculatedField.label == oneObject.label);
                            });

                            if (_.isUndefined(element)) {
                                scope.fieldsCalculatedField.push(oneObject);
                            }
                        });
                    }

                    function _getFieldsInShowInTotal() {
                        var showInTotal = scope.reportBuilder.showInTotal;
                        var showInTotalFields = [];

                        angular.forEach(showInTotal, function (oneObject) {
                            var aliasNames = oneObject.aliasName;
                            var fields = _.map(aliasNames, function (oneObject) {
                                return {
                                    key: oneObject.aliasName,
                                    label: oneObject.aliasName,
                                    root: oneObject.aliasName,
                                    type: 'decimal'
                                };
                            });

                            angular.forEach(fields, function (field) {
                                showInTotalFields.push(field);
                            });
                        });

                        return showInTotalFields;
                    }

                    function fieldIsDatetime(transform) {
                        var index = _.findIndex(transform.fields, function (field) {
                            for (var i in scope.reportBuilder.joinBy) {
                                var joinField = scope.reportBuilder.joinBy[i];
                                if (joinField.outputField == field) {
                                    return scope.dimensionsMetrics[joinField.joinFields[0].field + '_' + joinField.joinFields[0].dataSet] == 'datetime'
                                }
                            }

                            return scope.dimensionsMetrics[field] == 'datetime'
                        });

                        if (index == -1) {
                            transform.timezone = 'UTC'
                        }

                        return index > -1
                    }

                    function getCalculatedMetricName(typeKey) {
                        var defaultName = 'New Calculated Field';
                        if (!!typeKey) {
                            return typeKey;
                        }

                        return defaultName;
                    }

                    function enableDragDropQueryBuilder(enable) {
                        if (enable) {
                            scope.sortableOptions['disabled'] = false;
                        } else {
                            scope.sortableOptions['disabled'] = true;
                        }
                        scope.reorderTransformsAllowed = enable;
                    }

                    function formatExpressionToHighlight(field) {
                        if (!field) {
                            return;
                        }

                        field = angular.copy(field);
                        var expression = (!!field.field ? ('<strong>' + field.field + '</strong>' + ' = ') : '') + (angular.copy(field.expression) || '');

                        if (!expression) {
                            return null;
                        }
                        expression = expression.replace(/\s/g, '');

                        expression = expression.replace(/[\=]/g, ' = <div class="color-danger">');
                        expression = expression.replace(/[\+]/g, '</div> &nbsp + &nbsp <div class="color-danger">');
                        expression = expression.replace(/[\*]/g, '</div> &nbsp * &nbsp <div class="color-danger">');
                        expression = expression.replace(/\-\[/g, '</div> &nbsp - &nbsp <div class="color-danger">[');
                        expression = expression.replace(/\-\$/g, '</div> &nbsp - &nbsp <div class="color-danger">$');
                        expression = expression.replace(/\-\(/g, '</div> &nbsp - &nbsp <div class="color-danger">(');
                        expression = expression.replace(/\/\[/g, '</div> &nbsp \/ &nbsp <div class="color-danger">[');
                        expression = expression.replace(/\/\$/g, '</div> &nbsp \/ &nbsp <div class="color-danger">$');
                        expression = expression.replace(/\/\(/g, '</div> &nbsp \/ &nbsp <div class="color-danger">(');

                        return expression;
                    }

                    function addSpaceBeforeAndAfterOperator(field) {
                        field = AddCalculatedField.addSpaceBeforeAndAfterOperator(field);
                        return field;
                    }

                    scope.getSelectedFile = function (item) {
                        // note item.label is sent when the typedText wasn't found
                        return '[' + item.label + ']';
                    };

                    scope.getMacros = function (item) {
                        // note item.label is sent when the typedText wasn't found
                        return '$' + item.label;
                    };

                    scope.searchField = function (term) {
                        var fieldList = [];
                        _pushDateFieldToList();
                        angular.forEach(scope.fieldsCalculatedField, function (item) {
                            if (!!item && !!item.label && (typeof item.label == 'string') && item.label.toUpperCase().indexOf(term.toUpperCase()) >= 0) {
                                fieldList.push(item);
                            }
                        });
                        scope.fieldsCalculatedFieldCopy = fieldList;
                    };

                    scope.searchMacros = function (term) {
                        var fieldList = [];
                        _pushDateFieldToList();
                        scope.buildInMacros = angular.copy(scope.fieldsCalculatedField);
                        angular.forEach(scope.buildInDateTimeMacros, function (buildInMacro) {
                            var element = _.find(scope.buildInMacros, function (macro) {
                                return (buildInMacro.label == macro.label);
                            });

                            if (_.isUndefined(element)) {
                                scope.buildInMacros.push({
                                    key: buildInMacro.key,
                                    label: buildInMacro.label,
                                    root: buildInMacro.key,
                                    type: 'date'
                                });
                            }
                        });

                        angular.forEach(scope.buildInMacros, function (item) {
                            if (!!item && !!item.label && (typeof item.label == 'string') && item.label.toUpperCase().indexOf(term.toUpperCase()) >= 0) {
                                fieldList.push(item);
                            }
                        });

                        scope.buildInMacros = fieldList;
                    };

                    function _pushDateFieldToList() {
                        var dates = [];
                        angular.forEach(scope.fieldsCalculatedField, function (item) {
                            //Note: add a date field to field list. For example, __metric5_year (data-set-1). we add one field is metric5 (data-set-1) to selected list.
                            var newDate = null;
                            if (!!item && !!item.label && (typeof item.label == 'string') && item.label.indexOf('_year') >= 0) {
                                newDate = angular.copy(item);
                                newDate.label = newDate.label.replace('__', '');
                                newDate.label = newDate.label.replace('_year', '');
                                dates.push(newDate);
                            };
                        });

                        angular.forEach(dates, function (date) {
                            var hasExist = _.find(scope.fieldsCalculatedField, function (element) {
                                return (element.label ==  date.label);
                            });

                            if (_.isUndefined(hasExist)) {
                                scope.fieldsCalculatedField.push(date);
                            }
                        });
                    }

                    function unValidName(name) {
                        var fields = [];
                        angular.forEach(scope.calculatedMetrics, function (oneCalculatedMetric) {
                            fields.push(oneCalculatedMetric.field);
                        });

                        return _.filter(fields, function (field) {
                            return name == field && name != null;
                        }).length > 1;
                    }

                    function getTypesFieldNumber() {
                        var typesField = [];

                        angular.forEach(scope.typesField, function (type) {
                            if (type.key == 'decimal' || type.key == 'number') {
                                typesField.push(type)
                            }
                        });

                        return typesField;
                    }

                    function getTypesFieldForCalculatedField() {
                        var typesField = [];

                        angular.forEach(scope.typesField, function (type) {
                            // if (type.key == 'decimal' || type.key == 'number' || type.key ==  'text' || type.key == 'largeText') {
                            if (type.key == 'decimal' || type.key == 'number') {
                                typesField.push(type)
                            }
                        });

                        return typesField;
                    }

                    function filterFieldByText(field) {
                        return field.type == 'text' || field.type == 'largeText';
                    }

                    function getFieldNames(itemField) {
                        return _.filter(scope.fieldNames, function (fieldName) {
                            if (itemField == fieldName.key) {
                                return true;
                            }

                            for (var index in scope.transforms) {
                                var filter = scope.transforms[index];

                                if (filter.field == fieldName.key) {
                                    return false
                                }
                            }

                            return true;
                        })
                    }

                    function removeCalculatedMetric(index, transform) {
                        scope.calculatedMetrics.splice(index, 1);
                    }

                    function addCalculatedMetric() {
                        // Need id property to fix bug 6th: https://trello.com/c/Lxvf1gaL/2664-ur-uisupport-calculated-metrics-and-type-of-metrics-user-defined-expression-for-multiple-browsers
                        var length = !scope.calculatedMetrics ? 0 : scope.calculatedMetrics.length;
                        scope.calculatedMetrics.push({
                            field: '',
                            displayName: '',
                            type: "decimal",
                            defaultValue: 0,
                            calculationType: scope.calculatedMetricExressionType.useExpression,
                            expression: null,
                            openStatus: true,
                            id: length
                        });
                    }

                    function isExpressionType(calculatedMetric) {
                        return (calculatedMetric.calculationType == scope.calculatedMetricExressionType.useExpression);
                    }

                    scope.getMentioId = function(calcMetric) {
                        return 'mentioId' + calcMetric.id;
                    };

                    directive || (directive = $compile(content));
                    element.append(directive(scope, function ($compile) {
                        return $compile;
                    }));
                }
            }
        };
    }
})();