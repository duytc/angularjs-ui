(function () {
    'use strict';

    angular.module('tagcade.unifiedReport.report')
        .directive('transformDataSet', transformDataSet)
    ;

    function transformDataSet($compile, _, AddCalculatedField, CONNECT_TIMEZONES, COMPARISON_TYPES_CALCULATED_DEFAULT_VALUE, REPORT_BUILDER_TRANSFORMS_ALL_FIELD_TYPES, POSITIONS_FOR_REPLACE_TEXT, CONNECT_DATA_SOURCE_TYPE_FORMAT_ALL_FIELD_KEY, DATE_FORMAT_TYPES, METRICS_SET) {
        'use strict';

        return {
            scope: {
                transforms: '=',
                selectedFields: '=',
                totalDimensionsMetrics: '=',
                dimensionsMetrics: '=',
                dimensionsList: '=',
                selectedFieldsDateSet: '=',
                multiView: '=',
                showDimensions: '=',
                reorderTransformsAllowed: '=',
                reportBuilder: '='
            },
            restrict: 'AE',
            templateUrl: 'unifiedReport/report/directives/transformDataSet.tpl.html',
            compile: function (element, attrs) {
                var content, directive;
                content = element.contents().remove();
                return function (scope, element, attrs) {
                    scope.allFiledFormatTypes = REPORT_BUILDER_TRANSFORMS_ALL_FIELD_TYPES;
                    scope.allFiledFormatTypeKeys = CONNECT_DATA_SOURCE_TYPE_FORMAT_ALL_FIELD_KEY;
                    scope.timezones = CONNECT_TIMEZONES;
                    scope.dateFormatTypes = DATE_FORMAT_TYPES;
                    scope.typesField = METRICS_SET;
                    scope.positionsForReplaceText = POSITIONS_FOR_REPLACE_TEXT;
                    scope.reorderDefaultValueAllowed = false;

                    var totalDimensionsMetricsForDefaultValues = [];

                    scope.conditionComparators = COMPARISON_TYPES_CALCULATED_DEFAULT_VALUE;

                    scope.separatorType = [
                        {key: ',', label: 'Comma'},
                        {key: 'none', label: 'None'}
                    ];

                    // scope.fieldsTypeNumber = [];
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
                    scope.getFiledFormatTypes = getFiledFormatTypes;
                    scope.filterFieldNameForSortBy = filterFieldNameForSortBy;
                    scope.getFieldNamesList = getFieldNamesList;
                    scope.getTypesFieldNumber = getTypesFieldNumber;
                    scope.selectedFieldType = selectedFieldType;
                    scope.getTypesFieldAddField = getTypesFieldAddField;
                    scope.addSpaceBeforeAndAfterOperator = addSpaceBeforeAndAfterOperator;
                    scope.getTypesFieldForCalculatedField = getTypesFieldForCalculatedField;
                    scope.selectTypeCalculatedField = selectTypeCalculatedField;
                    scope.formatExpressionToHighlight = formatExpressionToHighlight;
                    scope.filterFieldByText = filterFieldByText;
                    scope.enableDragDropQueryBuilder = enableDragDropQueryBuilder;
                    scope.getLengthTransform = getLengthTransform;
                    scope.getTransformName = getTransformName;
                    scope.addCalculatedField = addCalculatedField;
                    scope.addDefaultValue = addDefaultValue;
                    scope.enableDragDropDefaultValue = enableDragDropDefaultValue;
                    scope.addCompareValue = addCompareValue;
                    scope.getTotalDimensionsMetricsForDefaultValues = getTotalDimensionsMetricsForDefaultValues;
                    scope.selectedComparison = selectedComparison;
                    scope.fieldIsDatetime = fieldIsDatetime;
                    
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

                        return index > -1
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

                    function addCompareValue(query) {
                        if (!/^[+-]?\d+(\.\d+)?$/.test(query)) {
                            return;
                        }

                        return query;
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

                        if(!!type.key && !!calculatedField){
                            calculatedField.expression = null
                        }
                    }

                    function addSpaceBeforeAndAfterOperator(field) {
                        field = AddCalculatedField.addSpaceBeforeAndAfterOperator(field);
                        return field;
                    }

                    // function getFieldsTypeNumber() {
                    //     scope.fieldsTypeNumber = [];
                    //
                    //     angular.forEach(scope.selectedFieldsDateSet, function (field) {
                    //         if (field.type == 'number' || field.type == 'decimal') {
                    //             scope.fieldsTypeNumber.push(field)
                    //         }
                    //     });
                    //
                    //     return scope.fieldsTypeNumber
                    // }

                    scope.getPeopleText = function (item) {
                        // note item.label is sent when the typedText wasn't found
                        return '[' + item.label + ']';
                    };

                    function getTypesFieldAddField() {
                        var typesField = [];

                        angular.forEach(scope.typesField, function (type) {
                            if (type.key == 'date' || type.key == 'text' || type.key == 'number') {
                                typesField.push(type)
                            }
                        });

                        return typesField;
                    }

                    function selectedFieldType(field) {
                        field.value = null;
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

                    function getFiledFormatTypes(transforms, currentType) {
                        var types = [];

                        angular.forEach(scope.allFiledFormatTypes, function (type) {
                            if (type.key == 'date' || type.key == 'number' || type.key == currentType) {
                                types.push(type);
                                return;
                            }

                            var indexTrans = _.findIndex(transforms, function (transform) {
                                return transform.type == type.key
                            });

                            if (indexTrans == -1) {
                                types.push(type);
                            }
                        });

                        if (scope.multiView == true && scope.showDimensions == false) {
                            types = _.filter(types, function (type) {
                                return (type.key != 'groupBy');
                            })
                        }

                        return types;
                    }

                    var filterDimensionField = false;

                    function getFieldForGroupList(transformFields) {
                        if (!filterDimensionField) {
                            filterDimensionField = true;
                            return scope.selectedFields
                        }

                        var data = [];

                        for (var index in scope.selectedFields) {
                            if (angular.isArray(transformFields) && transformFields.indexOf(scope.selectedFields[index].key) == -1) {
                                data.push(scope.selectedFields[index])
                            }
                        }

                        return data
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

                    function selectTransformType(transform, type) {
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

                    function removeTransform(index) {
                        scope.transforms.splice(index, 1);
                    }

                    function addTransform() {
                        scope.transforms.push({
                            fields: [],
                            openStatus: true
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

                    function addCalculatedField(fields){
                        fields.push({
                            field: null,
                            value: null,
                            defaultValues: []
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

                    directive || (directive = $compile(content));

                    element.append(directive(scope, function ($compile) {
                        return $compile;
                    }));
                }
            }
        };
    }
})();