(function () {
    'use strict';

    angular.module('tagcade.unifiedReport.report')
        .directive('calculatedMetric', calculatedMetric)
    ;

    function calculatedMetric($compile, $modal, _, AddCalculatedMetricUtil, REPORT_BUILDER_TRANSFORMS_ALL_FIELD_TYPES, POSITIONS_FOR_REPLACE_TEXT, REPORT_BUILDER_ALL_FIELD_TRANSFORMS_KEYS, DATE_FORMAT_TYPES, METRICS_SET, CALCULATED_METRIC_TYPE, BUILD_IN_DATE_TIME_MACROS) {
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

                    scope.fieldsCalculatedMetricField = [];
                    scope.buildInMacros = [];
                    scope.fieldNames = scope.selectedFields;

                    scope.$watch(function () {
                        return scope.selectedFields;
                    }, function () {
                        scope.fieldNames = scope.selectedFields;
                        //selectTypeCalculatedMetricField('all');
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
                    scope.selectCalculatedMetricExpressionType = selectCalculatedMetricExpressionType;
                    scope.isExpressionType = isExpressionType;
                    scope.isUserDefinedType = isUserDefinedType;
                    scope.getFieldNames = getFieldNames;
                    scope.getTypesFieldNumber = getTypesFieldNumber;
                    scope.addSpaceBeforeAndAfterOperator = addSpaceBeforeAndAfterOperator;
                    scope.getTypesFieldForCalculatedField = getTypesFieldForCalculatedField;
                    scope.formatExpressionToHighlight = formatExpressionToHighlight;
                    scope.filterFieldByText = filterFieldByText;
                    scope.enableDragDropQueryBuilder = enableDragDropQueryBuilder;
                    scope.getCalculatedMetricName = getCalculatedMetricName;
                    scope.fieldIsDatetime = fieldIsDatetime;
                    scope.selectTypeCalculatedMetricField = selectTypeCalculatedMetricField;
                    scope.addThisFieldToSelectedList = addThisFieldToSelectedList;
                    scope.unValidName = unValidName;

                    function selectTypeCalculatedMetricField(type) {
                        scope.fieldsCalculatedMetricField = [];
                        if (!type) {
                            return
                        }

                        //Get fields in dimension and metric of data set
                        if (type == 'number' || type == 'decimal' || type.key == 'number' || type.key == 'decimal') {
                            angular.forEach(scope.totalDimensionsMetrics, function (field) {
                                if (field.type == 'number' || field.type == 'decimal') {
                                    scope.fieldsCalculatedMetricField.push(field)
                                }
                            });

                        } else {
                            scope.fieldsCalculatedMetricField = scope.totalDimensionsMetrics;
                        }

                        //Get fields in add field transform
                        angular.forEach(scope.transforms, function (transform) {
                            if (transform.type == scope.allFiledFormatTypeKeys.addField || transform.type == scope.allFiledFormatTypeKeys.addConditionValue) {
                                angular.forEach(transform.fields, function (field) {
                                    if ((field.type == 'number' || field.type == 'decimal') && _.findIndex(scope.fieldsCalculatedMetricField, {key: field.field}) == -1) {
                                        scope.fieldsCalculatedMetricField.push({
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
                                    if (!!field.field && _.findIndex(scope.fieldsCalculatedMetricField, {key: field.field}) == -1) {
                                        scope.fieldsCalculatedMetricField.push({
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
                            if (!!calculatedMetric.field && _.findIndex(scope.fieldsCalculatedMetricField, {key: calculatedMetric.field}) == -1) {
                                scope.fieldsCalculatedMetricField.push({
                                    key: calculatedMetric.field,
                                    label: calculatedMetric.field,
                                    root: calculatedMetric.field,
                                    type: calculatedMetric.type
                                });
                            }
                        });
                        return scope.fieldsCalculatedMetricField;
                    }

                    function removeJoinFields(dates) {
                        var joinBys = scope.reportBuilder.joinBy || [];

                        _.each(joinBys, function (joinBy) {
                            _.each((joinBy.joinFields || []), function (joinField) {
                                dates.splice(_.findIndex(dates, function(date) {
                                    return date.root == joinField.field;
                                }), 1);
                            })
                        })

                        return dates;
                    }

                    function addThisFieldToSelectedList(calculatedField) {
                        var element = _.find(scope.fieldsCalculatedMetricField, function (oneField) {
                            return (oneField.label == calculatedField.field);
                        });

                        if (_.isUndefined(element)) {
                            scope.fieldsCalculatedMetricField.push({
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
                            var elementIndex = _.findIndex(scope.fieldsCalculatedMetricField, function (calculatedField) {
                                return (calculatedField.rootKey == oneObject.rootKey);
                            });

                            if(elementIndex !== -1)
                                scope.fieldsCalculatedMetricField.splice(elementIndex, 1);

                            scope.fieldsCalculatedMetricField.push(oneObject);
                        });
                    }

                    function _getFieldsInShowInTotal() {
                        var showInTotal = scope.reportBuilder.showInTotal;
                        var showInTotalFields = [];

                        angular.forEach(showInTotal, function (oneObject) {
                                var aliasNames = oneObject.aliasName;
                                var fields = _.map(aliasNames, function (oneObject) {
                                    oneObject = !_.isArray(oneObject) ? oneObject : _.first(oneObject);
                                    var aliasName = !_.isArray(oneObject.aliasName) ? oneObject.aliasName : _.first(oneObject.aliasName).aliasName;
                                    var originalName = !_.isArray(oneObject.aliasName) ? oneObject.originalName : _.first(oneObject.aliasName).originalName;

                                    return {
                                        rootKey: originalName,
                                        key: aliasName,
                                        label: aliasName,
                                        root: aliasName,
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

                        expression = expression.replace(/\s/g, '&nbsp;');
                        expression = expression.replace(/[[\\]/g, '<div class="color-danger">[');
                        expression = expression.replace(/[\]]/g, ']</div>');

                        /*expression = expression.replace(/[\=]/g, ' = <div class="color-danger">');
                        expression = expression.replace(/[\+]/g, '</div> &nbsp + &nbsp <div class="color-danger">');
                        expression = expression.replace(/[\*]/g, '</div> &nbsp * &nbsp <div class="color-danger">');
                        expression = expression.replace(/\-\[/g, '</div> &nbsp - &nbsp <div class="color-danger">[');
                        expression = expression.replace(/\-\$/g, '</div> &nbsp - &nbsp <div class="color-danger">$');
                        expression = expression.replace(/\-\(/g, '</div> &nbsp - &nbsp <div class="color-danger">(');
                        expression = expression.replace(/\/\[/g, '</div> &nbsp \/ &nbsp <div class="color-danger">[');
                        expression = expression.replace(/\/\$/g, '</div> &nbsp \/ &nbsp <div class="color-danger">$');
                        expression = expression.replace(/\/\(/g, '</div> &nbsp \/ &nbsp <div class="color-danger">(');*/

                        return expression;
                    }

                    var lastTime = Date.now();
                    function addSpaceBeforeAndAfterOperator(field) {
                        var now = Date.now();
                        if (now - lastTime < 1000) {
                            lastTime = now;
                            return;
                        }

                        lastTime = now;
                        field = AddCalculatedMetricUtil.addSpaceBeforeAndAfterOperator(field);
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
                        angular.forEach(scope.fieldsCalculatedMetricField, function (item) {
                            if (!!item && !!item.label && (typeof item.label == 'string') && item.label.toUpperCase().indexOf(term.toUpperCase()) >= 0) {
                                fieldList.push(item);
                            }
                        });
                        scope.fieldsCalculatedMetricFieldCopy = fieldList;
                    };

                    scope.searchMacros = function (term) {
                        var fieldList = [];
                        _pushDateFieldToList();
                        scope.buildInMacros = angular.copy(scope.fieldsCalculatedMetricField);
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

                        _pushFilterDataRangeToMacros();

                        angular.forEach(scope.buildInMacros, function (item) {
                            if (!!item && !!item.label && (typeof item.label == 'string') && item.label.toUpperCase().indexOf(term.toUpperCase()) >= 0) {
                                fieldList.push(item);
                            }
                        });

                        scope.buildInMacros = fieldList;
                    };

                    function _pushFilterDataRangeToMacros() {
                        var isDateRangeFilter = false;
                        _.each(scope.reportBuilder.reportViewDataSets, function (dataSet) {
                            isDateRangeFilter = !isDateRangeFilter ? !_.isEmpty(_.find(dataSet.filters, function (filter) {
                                var isDateRange = (filter.type == 'date' || filter.type == 'datetime') && !!filter.userProvided;
                                return isDateRange;
                            })) : isDateRangeFilter;
                        });

                        if(!!isDateRangeFilter) {
                            _.each(['startDate', 'endDate'], function(item) {
                                scope.buildInMacros.push({
                                    key: item,
                                    label: item,
                                    root: item,
                                    type: 'date'
                                });
                            });
                        }
                    }

                    function _pushDateFieldToList() {
                        var dates = [];
                        angular.forEach(scope.fieldsCalculatedMetricField, function (item) {
                            //Note: add a date field to field list. For example, __metric5_year (data-set-1). we add one field is metric5 (data-set-1) to selected list.
                            var newDate = null;
                            if (!!item && !!item.label && (typeof item.label == 'string') && item.label.indexOf('_year') >= 0) {
                                newDate = angular.copy(item);
                                newDate.label = newDate.label.replace('__', '');
                                newDate.label = newDate.label.replace('_year', '');
                                dates.push(newDate);
                            };
                        });

                        //remove joinFields dates before show
                        dates = removeJoinFields(dates);

                        angular.forEach(dates, function (date) {
                            var hasExist = _.find(scope.fieldsCalculatedMetricField, function (element) {
                                return (element.label ==  date.label);
                            });

                            if (_.isUndefined(hasExist)) {
                                scope.fieldsCalculatedMetricField.push(date);
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
                        scope.calculatedMetrics.push({
                            field: '',
                            displayName: '',
                            type: "decimal",
                            defaultValue: 0,
                            calculationType: scope.calculatedMetricExressionType.useExpression,
                            expression: null,
                            openStatus: true,
                            isVisible: true,
                            id: Math.round(Math.random() * 1.0e+10)
                        });
                    }

                    function selectCalculatedMetricExpressionType(index, calculatedMetricExpressionType) {
                        if (_.has(scope.calculatedMetrics, index) && calculatedMetricExpressionType == scope.calculatedMetricExressionType.userDefined) {
                            // reset default value
                            scope.calculatedMetrics[index].isVisible = true;
                        }
                    }

                    function isExpressionType(calculatedMetric) {
                        return (calculatedMetric.calculationType == scope.calculatedMetricExressionType.useExpression);
                    }

                    function isUserDefinedType(calculatedMetric) {
                        return (calculatedMetric.calculationType == scope.calculatedMetricExressionType.userDefined);
                    }

                    scope.getMentioId = function(calcMetric) {
                        return 'mentioId-' + calcMetric.id;
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