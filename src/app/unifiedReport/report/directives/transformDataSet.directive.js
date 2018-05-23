(function () {
    'use strict';

    angular.module('tagcade.unifiedReport.report')
        .directive('transformDataSet', transformDataSet)
    ;

    function transformDataSet($compile, $modal, _, AddCalculatedField, CONNECT_TIMEZONES, COMPARISON_TYPES_ADD_FIELD_VALUE, COMPARISON_TYPES_CALCULATED_DEFAULT_VALUE, REPORT_BUILDER_TRANSFORMS_ALL_FIELD_TYPES, POSITIONS_FOR_REPLACE_TEXT, REPORT_BUILDER_ALL_FIELD_TRANSFORMS_KEYS, DATE_FORMAT_TYPES, METRICS_SET, EXCHANGE_RATES) {
        'use strict';

        return {
            scope: {
                transforms: '=',
                selectedFields: '=',
                totalDimensionsMetrics: '=',
                dimensionsMetrics: '=',
                dimensionsList: '=',
                selectedFieldsDateSet: '=',
                reorderTransformsAllowed: '=',
                reportBuilder: '=',
                numberFields: '=',
                transformPosition: '@',
                disabled: '='
            },
            restrict: 'AE',
            templateUrl: 'unifiedReport/report/directives/transformDataSet.tpl.html',
            compile: function (element, attrs) {
                var content, directive;
                content = element.contents().remove();
                return function (scope, element, attrs) {
                    console.log(scope.reportBuilder);
                    scope.allFiledFormatTypes = REPORT_BUILDER_TRANSFORMS_ALL_FIELD_TYPES;
                    scope.allFiledFormatTypeKeys = REPORT_BUILDER_ALL_FIELD_TRANSFORMS_KEYS;
                    scope.timezones = CONNECT_TIMEZONES;
                    scope.dateFormatTypes = DATE_FORMAT_TYPES;
                    scope.typesField = METRICS_SET;
                    scope.positionsForReplaceText = POSITIONS_FOR_REPLACE_TEXT;
                    scope.reorderDefaultValueAllowed = false;
                    scope.selectAllDimensions = false;

                    var totalDimensionsMetricsForDefaultValues = [];
                    var filterDimensionField = false;
                    var filterFieldForAggregation = false;

                    scope.conditionComparators = angular.copy(COMPARISON_TYPES_CALCULATED_DEFAULT_VALUE);
                    scope.conditionComparatorsForAddField = COMPARISON_TYPES_ADD_FIELD_VALUE;

                    scope.conditionComparators.push({key: 'between', label: 'Between'});

                    scope.separatorType = [
                        {key: ',', label: 'Comma'},
                        {key: 'none', label: 'None'}
                    ];

                    scope.fieldsCalculatedField = [];
                    scope.fieldNames = scope.selectedFields;

                    scope.$watch(function () {
                        return scope.selectedFields;
                    }, function () {
                        scope.fieldNames = scope.selectedFields;

                        // getFieldsTypeNumber();
                        selectTypeCalculatedField('number');
                    }, true);

                    scope.$watch(function () {
                        return scope.reportBuilder;
                    }, function () {
                        var transform = _.find(scope.transforms, {type: 'groupBy'});
                        selectAllDimensionsForGroup(transform);
                    }, true);

                    scope.$watch(function () {
                        return scope.selectedFieldsDateSet;
                    }, function () {
                        totalDimensionsMetricsForDefaultValues = angular.copy(scope.selectedFieldsDateSet);
                        totalDimensionsMetricsForDefaultValues.unshift({key: '$$CALCULATED_VALUE$$', label: 'calculated value'});
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

                    scope.patternForAddField =  /^[a-zA-Z_][a-zA-Z0-9_$\s]*$/;

                    scope.removeTransform = removeTransform;
                    scope.addTransform = addTransform;
                    scope.addField = addField;
                    scope.addConditionAddField = addConditionAddField;
                    scope.addExpressionsAddField = addExpressionsAddField;
                    scope.addReplaceText = addReplaceText;
                    scope.removeAddValue = removeAddValue;
                    scope.addComparisonPercent = addComparisonPercent;
                    scope.notInMapField = notInMapField;
                    scope.filterFieldByType = filterFieldByType;
                    scope.selectType = selectType;
                    scope.selectTransformType = selectTransformType;
                    scope.filerFieldNamesForComparisonPercent = filerFieldNamesForComparisonPercent;
                    scope.getFieldNames = getFieldNames;
                    scope.getDimensionsMetricsForComparison = getDimensionsMetricsForComparison;
                    scope.getDimensionsMetricsForAddField = getDimensionsMetricsForAddField;
                    scope.getFieldForGroupList = getFieldForGroupList;
                    scope.getFieldForAggregation = getFieldForAggregation;
                    scope.getFiledFormatTypes = getFiledFormatTypes;
                    scope.filterFieldNameForSortBy = filterFieldNameForSortBy;
                    scope.getFieldNamesList = getFieldNamesList;
                    scope.getTypesFieldNumber = getTypesFieldNumber;
                    scope.selectedFieldType = selectedFieldType;
                    scope.selectTypeAddConditionValue = selectTypeAddConditionValue;
                    scope.getTypesFieldAddField = getTypesFieldAddField;
                    scope.addSpaceBeforeAndAfterOperator = addSpaceBeforeAndAfterOperator;
                    scope.getTypesFieldForCalculatedField = getTypesFieldForCalculatedField;
                    scope.getTypesFieldForAddConditionValue = getTypesFieldForAddConditionValue;
                    scope.formatExpressionToHighlight = formatExpressionToHighlight;
                    scope.filterFieldByText = filterFieldByText;
                    scope.filterFieldForGroup = filterFieldForGroup;
                    scope.filterFieldConditionForCalculatedField = filterFieldConditionForCalculatedField;
                    scope.enableDragDropQueryBuilder = enableDragDropQueryBuilder;
                    scope.getLengthTransform = getLengthTransform;
                    scope.getTransformName = getTransformName;
                    scope.addCalculatedField = addCalculatedField;
                    scope.addConditionValue = addConditionValue;
                    scope.addValueForExpressionAddField = addValueForExpressionAddField;
                    scope.fieldIsDatetime = fieldIsDatetime;
                    scope.selectedComparisonAddField = selectedComparisonAddField;
                    scope.selectedComparison = selectedComparison;
                    scope.selectedExpressionVar = selectedExpressionVar;
                    scope.filterOperatorAddField = filterOperatorAddField;
                    scope.filterConditionComparators = filterConditionComparators;
                    scope.selectAllDimensionsForGroup = selectAllDimensionsForGroup;
                    scope.filterFieldPostAggregation = filterFieldPostAggregation;
                    scope.isShowTransform = isShowTransform;
                    scope.filterFieldForAggregationGroup = filterFieldForAggregationGroup;
                    scope.unValidName = unValidName;
                    scope.selectTypeCalculatedField = selectTypeCalculatedField;
                    scope.enableDragDropDefaultValue = enableDragDropDefaultValue;
                    scope.addDefaultValue = addDefaultValue;
                    scope.getTotalDimensionsMetricsForDefaultValues = getTotalDimensionsMetricsForDefaultValues;
                    scope.addCompareValue = addCompareValue;
                    scope.ManageValues = ManageValues;
                    scope.setPattern = setPattern;
                    scope.expressionContainExchangeRate = expressionContainExchangeRate;

                    function setPattern(type) {
                        if(type == 'number') {
                            return '^[0-9]*$'
                        }

                        if(type == 'decimal') {
                            return '^[0-9]+([,.][0-9]+)?$';
                        }

                        return ''
                    }

                    function ManageValues(field) {
                        $modal.open({
                            templateUrl: 'unifiedReport/report/modal/listValues.tpl.html',
                            size: 'lg',
                            resolve: {
                                listValues: function (ReportViewAddConditionalTransformValues) {
                                    return ReportViewAddConditionalTransformValues.getList({ids: angular.toJson(field.values || [])})
                                        .then(function (listValues) {
                                            return listValues.plain()
                                        });
                                },
                                transform: function () {
                                    return field
                                },
                                fields: function () {
                                    return scope.selectedFieldsDateSet
                                },
                                reportBuilder: function () {
                                    return scope.reportBuilder
                                },
                                dimensionsMetrics: function () {
                                    return scope.dimensionsMetrics
                                }
                            },
                            controller: 'listValuesController'
                        });
                    }

                    function addCompareValue(query) {
                        if (!/^[+-]?\d+(\.\d+)?$/.test(query)) {
                            return;
                        }

                        return query;
                    }

                    function selectedComparison(defaultValue) {
                        defaultValue.conditionValue = null;
                    }

                    function getTotalDimensionsMetricsForDefaultValues() {
                        var fields = [];

                        angular.forEach(totalDimensionsMetricsForDefaultValues, function (field) {
                            fields.push(field);
                        });

                        return fields
                    }

                    function addDefaultValue(field) {
                        field.defaultValues = angular.isArray(field.defaultValues) ? field.defaultValues : [];

                        field.defaultValues.push({
                            conditionField: null,
                            conditionComparator: null,
                            conditionValue: null,
                            defaultValue: null
                        })
                    }

                    function enableDragDropDefaultValue(enable) {
                        if (enable) {
                            scope.sortableDefaultValueOptions['disabled'] = false;
                        } else {
                            scope.sortableDefaultValueOptions['disabled'] = true;
                        }

                        scope.reorderDefaultValueAllowed = enable;
                    }

                    function expressionContainExchangeRate(field) {
                        if(field.expression && field.expression.length > 0){
                            var expressionContainExchangeRate = false;
                            for (var i = 0; i < EXCHANGE_RATES.length; i++) {
                                if (field.expression.indexOf(EXCHANGE_RATES[i].key) >=0 ) {
                                    expressionContainExchangeRate = true;
                                    break;
                                }
                            }
                            return expressionContainExchangeRate;
                        }
                        return false;
                    }
                    function selectTypeCalculatedField(type, calculatedField) {
                        scope.fieldsCalculatedField = [];

                        if(!type) {
                            return
                        }

                        if (type == 'number' || type == 'decimal' || type.key == 'number' || type.key == 'decimal') {
                            angular.forEach(scope.totalDimensionsMetrics, function (field) {
                                if (field.type == 'number' || field.type == 'decimal') {
                                    scope.fieldsCalculatedField.push(field)
                                }
                            });
                        } else {
                            scope.fieldsCalculatedField = scope.totalDimensionsMetrics;
                        }

                        angular.forEach(scope.transforms, function (transform) {
                            if(transform.type == scope.allFiledFormatTypeKeys.addField || transform.type == scope.allFiledFormatTypeKeys.addConditionValue) {
                                angular.forEach(transform.fields, function (field) {
                                    if((field.type == 'number' || field.type == 'decimal') && _.findIndex(scope.fieldsCalculatedField, {key: field.field}) == -1) {
                                        scope.fieldsCalculatedField.push({
                                            key: field.field,
                                            label: field.field,
                                            root: field.field,
                                            type: field.type
                                        });
                                    }
                                });
                            }

                            if (transform.type == scope.allFiledFormatTypeKeys.addCalculatedField) {
                                angular.forEach(transform.fields, function (field) {
                                    if(!!field.field && _.findIndex(scope.fieldsCalculatedField, {key: field.field}) == -1) {
                                        scope.fieldsCalculatedField.push({
                                            key: field.field,
                                            label: field.field,
                                            root: field.field,
                                            type: field.type
                                        });
                                    }
                                })
                            }
                        });

                        // Add exchange rate
                        if (scope.fieldsCalculatedField && scope.fieldsCalculatedField.length > 0) {
                            angular.forEach(EXCHANGE_RATES, function (exchangeRate) {
                                scope.fieldsCalculatedField.push(exchangeRate);
                            });
                        }

                        if(!!type.key && !!calculatedField){
                            calculatedField.expression = null
                        }

                    }

                    function unValidName(name) {
                        var fields = [];

                        angular.forEach(_getAllFieldInTransForm(), function (field) {
                            fields.push(field.key);
                        });

                        return _.filter(fields, function(field){ return name == field && name != null; }).length > 1;
                    }

                    function filterFieldForAggregationGroup(field) {
                        return _.findIndex(_getAllFieldInTransForm('postGroupTransforms'), {key: field.key}) == -1
                    }

                    function isShowTransform(transform) {
                        if(transform.transformPosition == scope.transformPosition) {
                            return true
                        }

                        return false
                    }

                    function filterFieldPostAggregation(transform, currentField) {
                        return function (field) {
                            if(field.key == currentField) {
                                return true
                            }

                            for(var i in transform.fields) {
                                var fieldItem = transform.fields[i];

                                if(field.key == fieldItem.fieldName) {
                                    return false
                                }
                            }

                            return true
                        }
                    }

                    function selectAllDimensionsForGroup(transform) {
                        scope.selectAllDimensions = true;
                        transform.fields = [];

                        angular.forEach(scope.selectedFields, function (field) {
                            if(scope.reportBuilder.joinBy.length > 0) {
                                for(var index in scope.reportBuilder.joinBy) {
                                    if(scope.reportBuilder.joinBy[index].outputField == field.key) {
                                        if(!scope.reportBuilder.joinBy[index].isVisible) {
                                            return
                                        } else {
                                            if(transform.fields.indexOf(field.key) == -1) {
                                                transform.fields.push(field.key);
                                            }
                                        }
                                    }
                                }
                            }

                            if(transform.fields.indexOf(field.key) == -1 && _.findIndex(scope.dimensionsList, {key: field.key}) > -1) {
                                transform.fields.push(field.key);
                            }
                        });
                    }

                    function filterConditionComparators(defaultValue) {
                        return function (separator) {
                            if(!defaultValue.conditionField || (defaultValue.conditionField.indexOf('__') > -1 && (defaultValue.conditionField.indexOf('_day') > -1 || defaultValue.conditionField.indexOf('_month') > -1 || defaultValue.conditionField.indexOf('_year') > -1) && separator.key == 'between')) {
                                return false
                            }

                            if(!scope.dimensionsMetrics[defaultValue.conditionField] && separator.key == 'between') {
                                return true
                            }

                            if(scope.dimensionsMetrics[defaultValue.conditionField] != 'date' && scope.dimensionsMetrics[defaultValue.conditionField] != 'datetime' && separator.key == 'between') {
                                return false
                            }

                            return true;
                        }
                    }

                    function filterOperatorAddField(expression) {
                        return function (separator) {
                            if(!expression.var || (expression.var.indexOf('__') > -1 && (expression.var.indexOf('_day') > -1 || expression.var.indexOf('_month') > -1 || expression.var.indexOf('_year') > -1) && separator.key == 'between')) {
                                return false
                            }

                            if(!scope.dimensionsMetrics[expression.var] && separator.key == 'between') {
                                return true
                            }

                            if(scope.dimensionsMetrics[expression.var] != 'date' && scope.dimensionsMetrics[expression.var] != 'datetime' && separator.key == 'between') {
                                return false
                            }

                            if(separator.key == 'not contain' || separator.key == 'contain') {
                                return scope.dimensionsMetrics[expression.var] == 'text' || scope.dimensionsMetrics[expression.var] == 'largeText'
                            }

                            return true
                        }
                    }

                    function selectedComparisonAddField(defaultValue) {
                        defaultValue.val = null;
                    }

                    function selectedExpressionVar(defaultValue) {
                        defaultValue.cmp = null;
                    }

                    function fieldIsDatetime(transform) {
                        var index = _.findIndex(transform.fields, function (field) {
                            for(var i in scope.reportBuilder.joinBy) {
                                var joinField = scope.reportBuilder.joinBy[i];
                                if(joinField.outputField == field) {
                                    return scope.dimensionsMetrics[joinField.joinFields[0].field + '_' + joinField.joinFields[0].dataSet] == 'datetime'
                                }
                            }

                            return scope.dimensionsMetrics[field] == 'datetime'
                        });

                        if(index == -1) {
                            transform.timezone = 'UTC'
                        }

                        return index > -1
                    }

                    function addValueForExpressionAddField(query) {
                        return query;
                    }

                    function getTransformName(typeKey) {
                        var element,
                            defautlName ='New Transformation';
                        element = _.find(scope.allFiledFormatTypes, function (type){
                            return type.key == typeKey;
                        });

                        if(_.isEmpty(element)) {
                            return defautlName;
                        }

                        if(!'label' in element) {
                            return defautlName;
                        }

                        return element.label;

                    }

                    if (scope.reorderTransformsAllowed) {
                        scope.sortableOptions['disabled'] = false;
                    } else {
                        scope.sortableOptions['disabled'] = true;
                    }

                    function enableDragDropQueryBuilder(enable) {
                        if (enable) {
                            scope.sortableOptions['disabled'] = false;
                        } else {
                            scope.sortableOptions['disabled'] = true;
                        }
                        scope.reorderTransformsAllowed = enable;
                    }

                    function getLengthTransform (){
                        return scope.transforms.length;
                    }

                    function formatExpressionToHighlight(field) {
                        field = angular.copy(field);

                        if(!!field.fieldName) {
                            var fieldTemp = _.find(scope.totalDimensionsMetrics, {key: field.fieldName});

                            field.field = !!fieldTemp ? fieldTemp.label : fieldTemp;
                        }

                        var expression = (!!field.field ? ('<strong>' + field.field + '</strong>' + ' = ') : '') + (angular.copy(field.expression) || '');

                        if(!expression) {
                            return null;
                        }

                        expression = expression.replace(/\s/g, '&nbsp;');

                        // expression = expression.replace(/[(]/g, '<div class="color-danger">(</div>');
                        // expression = expression.replace(/[)]/g, '<div class="color-danger">)</div>');

                        expression = expression.replace(/[[\\]/g, '<div class="color-danger">[');
                        expression = expression.replace(/[\]]/g, ']</div>');

                        return expression;
                    }

                    function addSpaceBeforeAndAfterOperator(field) {
                        field = AddCalculatedField.addSpaceBeforeAndAfterOperator(field);
                        return field;
                    }

                    scope.getPeopleText = function (item) {
                        // note item.label is sent when the typedText wasn't found
                        return '[' + item.label + ']';
                    };

                    function getTypesFieldAddField() {
                        var typesField = [];

                        angular.forEach(scope.typesField, function (type) {
                            if (type.key == 'date' || type.key == 'text' || type.key == 'number' || type.key == 'decimal') {
                                typesField.push(type)
                            }
                        });

                        return typesField;
                    }

                    function selectedFieldType(field) {
                        field.value = null;
                        
                        angular.forEach(field.conditions, function (condition) {
                            condition.value = null;
                        })
                    }

                    function selectTypeAddConditionValue(field) {
                        field.defaultValue = null;
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

                    function getTypesFieldForAddConditionValue() {
                        var typesField = [];

                        angular.forEach(scope.typesField, function (type) {
                            if (type.key == 'decimal' || type.key == 'number' || type.key ==  'text' || type.key == 'date') {
                                typesField.push(type)
                            }
                        });

                        return typesField;
                    }

                    function filterFieldNameForSortBy(fields, item) {
                        return function (field) {
                            if (!angular.isArray(fields) || !angular.isObject(fields[0]) || !angular.isObject(fields[1])) {
                                return true
                            }

                            if (item.names.indexOf(field.key) > -1) {
                                return true
                            }

                            var findItem = _.find(fields, function (field) {
                                return field.direction != item.direction;
                            });

                            return findItem.names.indexOf(field.key) == -1;
                        }
                    }

                    function getFiledFormatTypes(transforms, currentType, transform) {
                        var types = [];

                        angular.forEach(scope.allFiledFormatTypes, function (type) {
                            if(scope.transformPosition == 'prePostTransforms' && (type.key == 'sortBy' || type.key == 'comparisonPercent')) {
                                return
                            }

                            if (type.key == 'date' || type.key == 'number' || type.key == currentType) {
                                types.push(type);
                                return;
                            }

                            var indexTrans = _.findIndex(transforms, function (transform) {
                                return transform.type == type.key && transform.transformPosition == scope.transformPosition
                            });

                            if (indexTrans == -1) {
                                types.push(type);
                            }
                        });

                        types = _.filter(types, function (type) {
                            return (type.key != 'groupBy');
                        });

                        return types;
                    }

                    function getFieldForGroupList(transformFields) {
                        if (!filterDimensionField) {
                            filterDimensionField = true;
                            return scope.dimensionsList
                        }

                        var data = [];

                        for (var index in scope.dimensionsList) {
                            if (angular.isArray(transformFields) && transformFields.indexOf(scope.dimensionsList[index].key) == -1) {
                                data.push(scope.dimensionsList[index])
                            }
                        }

                        return data
                    }

                    function getFieldForAggregation(transformFields) {
                        if (!filterFieldForAggregation) {
                            filterFieldForAggregation = true;
                            return scope.numberFields
                        }

                        var data = [];

                        for (var index in scope.numberFields) {
                            if (angular.isArray(transformFields) && transformFields.indexOf(scope.numberFields[index].key) == -1) {
                                data.push(scope.numberFields[index])
                            }
                        }

                        return data
                    }

                    function filterFieldForGroup(field) {
                       return field.type != 'number' && field.type != 'decimal';
                    }

                    var filterFieldNameAscField = false;
                    var filterFieldNameDescField = false;

                    function getFieldNamesList(fieldNames, direction) {
                        if (!filterFieldNameAscField && direction == 'asc') {
                            filterFieldNameAscField = true;
                            return scope.fieldNames
                        }

                        if (!filterFieldNameDescField && direction == 'desc') {
                            filterFieldNameDescField = true;
                            return scope.fieldNames
                        }

                        var data = [];

                        for (var index in scope.fieldNames) {
                            if (angular.isArray(fieldNames) && fieldNames.indexOf(scope.fieldNames[index].key) == -1) {
                                data.push(scope.fieldNames[index])
                            }
                        }

                        return data
                    }

                    function getDimensionsMetricsForAddField(fields, fieldCurrent) {
                        var data = [fieldCurrent];

                        angular.forEach(scope.totalDimensionsMetrics, function (field) {
                            var hasField = _.find(fields, function (item) {
                                return item.field == field;
                            });

                            if (!hasField) {
                                data.push(field);
                            }
                        });

                        return data;
                    }

                    function filterFieldByText(field) {
                        return field.type == 'text' || field.type == 'largeText';
                    }

                    function filterFieldConditionForCalculatedField(field) {
                        return field.type == 'date' || field.type == 'datetime' || field.type == 'number' || field.type == 'decimal' || field.key == '$$CALCULATED_VALUE$$';
                    }

                    function getDimensionsMetricsForComparison(fields, fieldCurrent) {
                        var data = [fieldCurrent];

                        angular.forEach(scope.totalDimensionsMetrics, function (field) {
                            var hasField = _.find(fields, function (item) {
                                return item.field == field;
                            });

                            if (!hasField) {
                                data.push(field);
                            }
                        });

                        return data;
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

                    function filerFieldNamesForComparisonPercent() {
                        var fields = [];

                        angular.forEach(scope.totalDimensionsMetrics, function (field) {
                            if (scope.dimensionsMetrics[field.key] == 'number' || scope.dimensionsMetrics[field.key] == 'decimal') {
                                fields.push(field);
                            }
                        });

                        return fields;
                    }

                    function selectTransformType(transform, type, $index) {
                        transform.field = null;
                        transform.fields = [];

                        setTimeout(function () {
                            if (type.key == scope.allFiledFormatTypeKeys.sortBy) {
                                transform.fields.push({names: [], direction: 'asc'}, {names: [], direction: 'desc'});
                            }
                        }, 0);

                        if (type.key == scope.allFiledFormatTypeKeys.groupBy) {
                            transform.timezone = 'UTC'
                        }

                        if (type.key == scope.allFiledFormatTypeKeys.comparisonPercent) {
                            transform.fields = [{field: null, numerator: null, denominator: null}];
                        }

                        if (type.key == scope.allFiledFormatTypeKeys.addField) {
                            transform.fields = [{field: null, value: null}];
                        }

                        if (type.key == scope.allFiledFormatTypeKeys.addCalculatedField) {
                            transform.fields = [{field: null, expression: null}];
                        }

                        if (type.key == scope.allFiledFormatTypeKeys.groupBy) {
                            scope.transforms.splice($index, 1);
                            scope.transforms.unshift(transform);
                        }
                    }

                    function selectType(transform) {
                        transform.field = null;
                        transform.fields = [];
                    }

                    function filterFieldByType(transform) {
                        return function (field) {
                            if (transform.type == 'date' && (scope.dimensionsMetrics[field.key] == 'date' || scope.dimensionsMetrics[field.key] == 'datetime')) {
                                return true;
                            }

                            return !!(transform.type == 'number' && (scope.dimensionsMetrics[field.key] == 'number' || scope.dimensionsMetrics[field.key] == 'decimal'));


                        };
                    }

                    function notInMapField(field) {
                        return _.values(scope.selectedFields).indexOf(field) == -1;
                    }

                    function removeTransform(index, transform) {
                        scope.transforms.splice(index, 1);
                    }

                    function addTransform() {
                        scope.transforms.push({
                            fields: [],
                            openStatus: true,
                            transformPosition: scope.transformPosition
                        });
                    }

                    function addComparisonPercent(fields) {
                        fields.push({
                            field: null,
                            numerator: null,
                            denominator: null
                        });
                    }

                    function addField(fields) {
                        fields.push({
                            field: null,
                            value: null
                        });
                    }
                    
                    function addConditionAddField(field) {
                        field.conditions = angular.isArray(field.conditions) ? field.conditions : [];

                        field.conditions.push({
                            expressions: [
                                {
                                    var: null,
                                    cmp: null,
                                    val: null
                                }
                            ],
                            value: null
                        })
                    }

                    function addExpressionsAddField(field) {
                        field.expressions = angular.isArray(field.expressions) ? field.expressions : [];

                        field.expressions.push({
                            var: null,
                            cmp: null,
                            val: null
                        })
                    }

                    function addCalculatedField(fields){
                        fields.push({
                            var: null,
                            cmp: null,
                            val: null,
                            type: null
                        });
                    }

                    function addConditionValue(fields){
                        fields.push({
                            values: [],
                            field: null,
                            defaultValue: null,
                            type: null
                        });
                    }

                    function addReplaceText(fields) {
                        fields.push({
                            field: null,
                            isOverride: false,
                            targetField: null,
                            searchFor: null,
                            position: null,
                            replaceWith: null
                        });
                    }

                    function removeAddValue(fields, index) {
                        var tempIndex;

                        angular.forEach(scope.selectedFields, function (selectedField) {
                            if (selectedField.name == fields[index].field) {
                                tempIndex = scope.selectedFields.indexOf(selectedField);
                                scope.selectedFields.splice(tempIndex, 1);
                            }
                        });

                        fields.splice(index, 1);
                    }

                    function _getAllFieldInTransForm(transformPosition) {
                        var fieldsTransForm = [];
                        angular.forEach(scope.transforms, function (transform) {
                            if (transform.type == 'addField' || transform.type == 'addCalculatedField' || transform.type == 'addConditionValue' || transform.type == 'comparisonPercent') {
                                if(!transformPosition || (!!transformPosition && transformPosition == transform.transformPosition)) {
                                    angular.forEach(transform.fields, function (field) {
                                        if (!!field.field) {
                                            fieldsTransForm.push({
                                                label: field.field,
                                                key: field.field,
                                                root: field.field,
                                                type: field.type,
                                                transformType: transform.type
                                            });
                                        }
                                    })
                                }
                            }
                        });
                        return fieldsTransForm;
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