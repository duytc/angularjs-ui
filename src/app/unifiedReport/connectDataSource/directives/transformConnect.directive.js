(function (){
    'use strict';

    angular.module('tagcade.unifiedReport.connect')
        .directive('transformConnect', transformConnect)
    ;

    function transformConnect($compile, AddCalculatedField, _, COMPARISON_TYPES_CALCULATED_DEFAULT_VALUE, REPORT_VIEW_INTERNAL_FIELD_VARIABLE, CONNECT_DATA_SOURCE_TYPE_FORMAT_ALL_FIELD, POSITIONS_FOR_REPLACE_TEXT, CONNECT_DATA_SOURCE_TYPE_FORMAT_ALL_FIELD_KEY, DATE_FORMAT_TYPES){
        'use strict';

        return {
            scope: {
                transforms: '=',
                listDataSets: '=',
                itemDataSet: '=',
                mapFields: '=',
                totalDimensionsMetrics: '=',
                dimensionsMetrics: '=',
                dataSourceFields: '=listDataSourceFields',
                reorderTransformsAllowed: '='
            },
            restrict: 'AE',
            templateUrl: 'unifiedReport/connectDataSource/directives/transformConnect.tpl.html',
            compile: function (element, attrs){
                var content, directive;
                content = element.contents().remove();
                return function (scope, element, attrs){
                    const CALCULATED_VALUE = '$$CALCULATED_VALUE$$';
                    scope.allFiledFormatTypes = CONNECT_DATA_SOURCE_TYPE_FORMAT_ALL_FIELD;
                    scope.allFiledFormatTypeKeys = CONNECT_DATA_SOURCE_TYPE_FORMAT_ALL_FIELD_KEY;
                    scope.dateFormatTypes = DATE_FORMAT_TYPES;
                    scope.fieldForExpression = [];
                    scope.fieldForExpressionInCalculated = [];
                    scope.positionsForReplaceText = POSITIONS_FOR_REPLACE_TEXT;
                    scope.dataSourceFieldsCopy = angular.copy(scope.dataSourceFields).concat(_getAllFieldInTransform(scope.transforms));
                    scope.reorderDefaultValueAllowed = false;

                    scope.separatorType = [
                        {key: ',', label: 'Comma'},
                        {key: 'none', label: 'None'}
                    ];


                    scope.conditionComparators = COMPARISON_TYPES_CALCULATED_DEFAULT_VALUE;

                    scope.operatorForCustom = [
                        {key: 'equal', label: 'Is'},
                        {key: 'notEqual', label: 'Is Not'},
                        {key: 'contain', label: 'Contains'},
                        {key: 'notContain', label: 'Does Not Contain'}
                    ];

                    scope.datePickerOpts = {
                        singleDatePicker: true
                    };

                    scope.fieldNames = _.isArray(scope.mapFields) ? scope.mapFields : _.union(_.values(scope.mapFields));

                    scope.$watch(function (){
                        return scope.mapFields;
                    }, function (){
                        scope.fieldNames = _.isArray(scope.mapFields) ? scope.mapFields : _.union(_.values(scope.mapFields));
                    }, true);

                    scope.$watch(function (){
                        return scope.transforms;
                    }, function (){
                        selectTypeAddCalculatedField();
                    }, true);

                    scope.sortableOptions = {
                        disabled: false,
                        forcePlaceholderSize: true,
                        placeholder: 'sortable-placeholder'
                    };

                    if (scope.reorderTransformsAllowed) {
                        scope.sortableOptions['disabled'] = false;
                    } else {
                        scope.sortableOptions['disabled'] = true;
                    }

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

                    scope._getTotalFieldDataSetInAugmentation = _getTotalFieldDataSetInAugmentation;
                    scope.removeTransform = removeTransform;
                    scope.addTransform = addTransform;
                    scope.addField = addField;
                    scope.addCalculatedField = addCalculatedField;
                    scope.addReplaceText = addReplaceText;
                    scope.addMapFields = addMapFields;
                    scope.addCustomCondition = addCustomCondition;
                    scope.removeAddValue = removeAddValue;
                    scope.addComparisonPercent = addComparisonPercent;
                    scope.notInMapField = notInMapField;
                    scope.filterFieldByType = filterFieldByType;
                    scope.filterFieldByText = filterFieldByText;
                    scope.selectTransformType = selectTransformType;
                    scope.filerFieldNamesForComparisonPercent = filerFieldNamesForComparisonPercent;
                    scope.getFieldNames = getFieldNames;
                    scope.getDimensionsMetricsForComparison = getDimensionsMetricsForComparison;
                    scope.getDimensionsMetricsForAddField = getDimensionsMetricsForAddField;
                    scope.getDimensionsMetricsForTextAddField = getDimensionsMetricsForTextAddField;
                    scope.getDimensionsMetricsForTextAddReplace = getDimensionsMetricsForTextAddReplace;
                    scope.getDimensionsMetricsForTextAddReplace = getDimensionsMetricsForTextAddReplace;
                    scope.getDimensionsMetricsForNumberAddField = getDimensionsMetricsForNumberAddField;
                    scope.getTotalDimensionsMetricsForDefaultValues = getTotalDimensionsMetricsForDefaultValues;
                    scope.getFiledFormatTypes = getFiledFormatTypes;
                    scope.filterFieldNameForSortBy = filterFieldNameForSortBy;
                    scope.addSpaceBeforeAndAfterOperator = addSpaceBeforeAndAfterOperator;
                    scope.selectTypeAddField = selectTypeAddField;
                    scope.getFieldForGroupBy = getFieldForGroupBy;
                    scope.removeAutoSpaceAfterField = removeAutoSpaceAfterField;
                    scope.formatExpressionToHighlight = formatExpressionToHighlight;
                    scope.addExtractPattern = addExtractPattern;
                    scope.filterFieldsForInputField = filterFieldsForInputField;
                    scope.filterFieldInTransformExtractPattern = filterFieldInTransformExtractPattern;
                    scope.filterFieldInTransformReplaceText = filterFieldInTransformReplaceText;
                    scope.getDataSourceFieldsForReplace = getDataSourceFieldsForReplace;
                    scope.getDataSourceFieldsForExtractPattern = getDataSourceFieldsForExtractPattern;
                    scope.disabledOverrideValue = disabledOverrideValue;
                    scope.filterTextFields = filterTextFields;
                    scope.resetFieldNameInReplaceTextTransform = resetFieldNameInReplaceTextTransform;
                    scope.disableOverride = disableOverride;
                    scope.selectTypeAddCalculatedField = selectTypeAddCalculatedField;
                    scope.enableDragDropQueryBuilder = enableDragDropQueryBuilder;
                    scope.enableDragDropDefaultValue = enableDragDropDefaultValue;
                    scope.getLengthTransform = getLengthTransform;
                    scope.filterNumberFields = filterNumberFields;
                    scope.selectCustomFormatDate = selectCustomFormatDate;
                    scope.getTransformName = getTransformName;
                    scope.filterFieldByTextAndDate = filterFieldByTextAndDate;
                    scope.selectDataSet = selectDataSet;
                    scope.filterDataSet = filterDataSet;
                    scope.filterMapFieldLeftSide = filterMapFieldLeftSide;
                    scope.filterMapFieldRightSide = filterMapFieldRightSide;
                    scope.getSeparatorType = getSeparatorType;
                    scope.selectCustomField = selectCustomField;
                    scope.isValueForCustom = isValueForCustom;
                    scope.isDateForCustom = isDateForCustom;
                    scope.addDefaultValue = addDefaultValue;
                    scope.addCompareValue = addCompareValue;
                    scope.selectedComparison = selectedComparison;
                    scope.addMapFieldForSubsetGroup = addMapFieldForSubsetGroup;
                    scope.getFieldForLeftSideAugmentation = getFieldForLeftSideAugmentation;

                    function getFieldForLeftSideAugmentation(transform) {
                        var fields = angular.copy(scope.dataSourceFields);

                        for (var index in scope.transforms) {
                            var transformItem  = scope.transforms[index];

                            if(transformItem.type == 'augmentation' && transformItem.mapDataSet != transform.mapDataSet) {
                                angular.forEach(transformItem.mapFields, function (mapField) {
                                    if(!!mapField.leftSide) {
                                        fields.push(mapField.leftSide);
                                    }
                                })
                            }
                        }

                        return _.union(fields)
                    }

                    function addMapFieldForSubsetGroup(mapFields) {
                        mapFields.push({leftSide: null, rightSide: null});
                    }

                    function selectedComparison(defaultValue) {
                        defaultValue.conditionValue = null;
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

                    function isValueForCustom(custom, transform) {
                        var totalField = _getTotalFieldDataSetInAugmentation(transform.mapDataSet);

                        return custom.operator != 'null' && custom.operator != 'notNull' && totalField[custom.field] != 'date' && totalField[custom.field] != 'datetime'
                    }

                    function isDateForCustom(custom, transform) {
                        var totalField = _getTotalFieldDataSetInAugmentation(transform.mapDataSet);

                        return custom.operator != 'null' && custom.operator != 'notNull' && (totalField[custom.field] == 'date' || totalField[custom.field] == 'datetime')
                    }

                    function selectCustomField(custom) {
                        custom.operator = null;
                        custom.value = null
                    }

                    function getSeparatorType(transform, field) {
                        return scope.operatorForCustom
                    }

                    function filterMapFieldLeftSide(transform, mapFieldThis) {
                        var totalField = _getTotalFieldDataSetInAugmentation(transform.mapDataSet);

                        if(scope.dimensionsMetrics[mapFieldThis.leftSide] != totalField[mapFieldThis.rightSide]) {
                            mapFieldThis.rightSide = null;
                        }

                        return function (field){
                            for(var index in transform.mapFields) {
                                var mapField = transform.mapFields[index];

                                if(mapField.leftSide == field && mapFieldThis.leftSide != field) {
                                    return false
                                }
                            }

                            return true
                        };
                    }

                    function filterMapFieldRightSide(transform, mapFieldThis) {
                        return function (field){
                            for(var index in transform.mapFields) {
                                var mapField = transform.mapFields[index];

                                if(!!mapField.leftSide) {
                                    var totalField = _getTotalFieldDataSetInAugmentation(transform.mapDataSet);

                                    if(scope.dimensionsMetrics[mapFieldThis.leftSide] != totalField[field]) {
                                        return false
                                    }
                                }

                                if(mapField.rightSide == field && mapFieldThis.rightSide != field) {
                                    return false
                                }
                            }

                            return true
                        };
                    }

                    function filterDataSet(dataSetCurrent) {
                        return function (dataSet) {
                            for(var index in scope.transforms) {
                                var transform = scope.transforms[index];

                                if(transform.type == 'augmentation') {
                                    if(transform.mapDataSet == dataSet.id && dataSetCurrent != dataSet.id) {
                                        return false
                                    }
                                }
                            }

                            if(dataSet.id == scope.itemDataSet || dataSet.id == scope.itemDataSet.id) {
                                return false
                            }

                            return true
                        }
                    }

                    function selectDataSet(dataSet, transform) {
                        transform.mapCondition = {
                            leftSide: null,
                            rightSide: null
                        };
                        transform.mapFields = [{
                            leftSide: null,
                            rightSide: null
                        }];

                        transform.allFieldsDataSet = _.keys(dataSet.dimensions).concat(_.keys(dataSet.metrics));
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

                    function selectCustomFormatDate(transform) {
                        transform.from = null;
                    }

                    function enableDragDropQueryBuilder(enable) {
                        if (enable) {
                            scope.sortableOptions['disabled'] = false;
                        } else {
                            scope.sortableOptions['disabled'] = true;
                        }

                        scope.reorderTransformsAllowed = enable;
                    }

                    function enableDragDropDefaultValue(enable) {
                        if (enable) {
                            scope.sortableDefaultValueOptions['disabled'] = false;
                        } else {
                            scope.sortableDefaultValueOptions['disabled'] = true;
                        }

                        scope.reorderDefaultValueAllowed = enable;
                    }

                    function getLengthTransform () {
                        return scope.transforms.length;
                    }

                    function disabledOverrideValue(field) {
                        return REPORT_VIEW_INTERNAL_FIELD_VARIABLE.indexOf(field) > -1
                    }

                    function getDataSourceFieldsForReplace(checkBoxValue){
                        if (!(checkBoxValue)) {
                            return _.uniq(angular.copy(scope.dataSourceFields).concat(_getAllFieldInTransform(scope.transforms)).concat(REPORT_VIEW_INTERNAL_FIELD_VARIABLE));
                        } else  {
                            return _.uniq(angular.copy(scope.dataSourceFields).concat(_getAllFieldInTransform(scope.transforms)))
                        }
                    }

                    function resetFieldNameInReplaceTextTransform(checkBoxValue, replaceText){
                        if (checkBoxValue) {
                            if (_.contains(REPORT_VIEW_INTERNAL_FIELD_VARIABLE, replaceText.field)) {
                                replaceText.fieldValue =  undefined;
                            }
                        }

                        return replaceText;
                    }

                    function disableOverride(field) {
                        return _.contains(REPORT_VIEW_INTERNAL_FIELD_VARIABLE, field);
                    }

                    function getDataSourceFieldsForExtractPattern() {
                        return _.uniq(angular.copy(scope.dataSourceFields).concat(_getAllFieldInTransform(scope.transforms)).concat(REPORT_VIEW_INTERNAL_FIELD_VARIABLE));
                    }

                    function filterFieldInTransformExtractPattern(field) {
                        for (var index in scope.transforms) {
                            var transform = scope.transforms[index];

                            if(transform.type == 'addField' || transform.type == 'replaceText' || transform.type == 'extractPattern') {
                                for(var indexField in transform.fields) {
                                    var fieldTransform = transform.fields[indexField];

                                    if(field == fieldTransform.field) {
                                        return false
                                    }

                                    if(field == fieldTransform.targetField) {
                                        return false
                                    }
                                }
                            }
                        }

                        return true;
                    }

                    function filterFieldInTransformReplaceText(field) {
                        for (var index in scope.transforms) {
                            var transform = scope.transforms[index];

                            if (transform.type == 'addField' || transform.type == 'replaceText' || transform.type == 'extractPattern') {
                                for (var indexField in transform.fields) {
                                    var fieldTransform = transform.fields[indexField];

                                    if(field == fieldTransform.field) {
                                        return false
                                    }

                                    if(field == fieldTransform.targetField) {
                                        // TODO return false
                                    }
                                }
                            }
                        }

                        return true;
                    }

                    function formatExpressionToHighlight(field){
                        var expression = (!!field.field ? ('<strong>' + field.field + '</strong>' + ' = ') : '') + (angular.copy(field.expression) || angular.copy(field.value) || '');

                        if (!expression) {
                            return null;
                        }

                        expression = expression.replace(/\s/g, '&nbsp;');

                        // expression = expression.replace(/[(]/g, '<div class="color-danger">(</div>');
                        // expression = expression.replace(/[)]/g, '<div class="color-danger">)</div>');

                        expression = expression.replace(/[[\\]/g, '<div class="color-danger">[');
                        expression = expression.replace(/[\]]/g, ']</div>');

                        return expression;
                    }

                    function getFieldForGroupBy(transforms){
                        var fieldInConcat = [];
                        angular.forEach(transforms, function (transform){
                            switch (transform.type) {
                                case 'addField':
                                    angular.forEach(transform.fields, function (field){
                                        if (!'field' in field) {
                                            return;
                                        }

                                        if (!_.isNull(field.field)){
                                            fieldInConcat.push(field.field)
                                        }
                                    });
                                    break;
                                // case 'addCalculatedField':
                                //     angular.forEach(transform.fields, function (field){
                                //         fieldInConcat.push(field.field)
                                //     });
                                //     break;
                                case 'extractPattern':
                                    angular.forEach(transform.fields, function (field){
                                        if (!'targetField' in field || !'isOverride' in field) {
                                            return;
                                        }

                                        if (!_.isNull(field.targetField) && !field.isOverride){
                                            fieldInConcat.push(field.targetField)
                                        }
                                    });
                                    break;
                                case 'replaceText':
                                    angular.forEach(transform.fields, function (field){
                                        if (!'targetField' in field || !'isOverride' in field) {
                                            return;
                                        }

                                        if (!_.isNull(field.targetField) && !field.isOverride){
                                            fieldInConcat.push(field.targetField)
                                        }
                                    });
                                    break;
                                case 'augmentation':
                                    angular.forEach(transform.mapFields, function (mapField){
                                        if (!_.isNull(mapField.leftSide)){
                                            fieldInConcat.push(mapField.leftSide)
                                        }
                                    });
                                    break;
                                // case 'subset-group':
                                //     angular.forEach(transform.mapFields, function (mapField){
                                //         if (!_.isNull(mapField.leftSide)){
                                //             fieldInConcat.push(mapField.leftSide)
                                //         }
                                //     });
                                //     break;
                            }
                        });

                        return _.union(scope.dataSourceFields.concat(fieldInConcat));
                    }

                    function removeAutoSpaceAfterField(field, id){
                        var elemId = 'concatenated-'.concat(id);
                        if (!'expression' in field) {
                            return field;
                        }
                        setCaretPosition(elemId, !!field.expression ? field.expression.length : field.value.length);

                        return field;
                    }

                    function setCaretPosition(elemId, caretPos){

                        var elem = document.getElementById(elemId);
                        if (elem != null) {
                            if (elem.createTextRange) {
                                var range = elem.createTextRange();
                                range.move('character', caretPos);
                                range.select();
                            }
                            else {
                                if (elem.selectionStart) {
                                    elem.focus();
                                    elem.setSelectionRange(caretPos, caretPos);
                                }
                                else
                                    elem.focus();
                            }
                        }
                    }

                    function selectTypeAddField(field, calculatedField){
                        scope.fieldForExpression = [];

                        angular.forEach(REPORT_VIEW_INTERNAL_FIELD_VARIABLE, function (field){
                            scope.fieldForExpression.push({label: field});
                        });

                        angular.forEach(scope.dataSourceFields, function (item){
                            if (!item || item == '') {
                                return;
                            }

                            scope.fieldForExpression.push({label: item});
                        });

                        // if (scope.dimensionsMetrics[field] == 'number' || scope.dimensionsMetrics[field] == 'decimal') {
                        //     angular.forEach(scope.dataSourceFields, function (item) {
                        //         if (!item || item == '') {
                        //             return;
                        //         }
                        //
                        //         if (scope.dimensionsMetrics[item] == 'number' || scope.dimensionsMetrics[item] == 'decimal') {
                        //             scope.fieldForExpression.push({label: item});
                        //         }
                        //     });
                        // } else {
                        //     angular.forEach(scope.dataSourceFields, function (item) {
                        //         if (!item || item == '') {
                        //             return;
                        //         }
                        //
                        //         scope.fieldForExpression.push({label: item});
                        //     });
                        // }

                        if (!!field && !!calculatedField) {
                            calculatedField.expression = null
                        }
                    }

                    function selectTypeAddCalculatedField(field, calculatedField){
                        scope.fieldForExpressionInCalculated = [];

                        /*angular.forEach(REPORT_VIEW_INTERNAL_FIELD_VARIABLE, function (field){
                            scope.fieldForExpression.push({label: field});
                        });*/

                        angular.forEach(scope.dataSourceFields, function (item){
                            if (!item || item == '') {
                                return;
                            }

                            scope.fieldForExpressionInCalculated.push({label: item});
                        });


                        angular.forEach(scope.transforms, function (transform) {
                            if(transform.type == 'subset-group' || transform.type == 'augmentation') {
                                angular.forEach(transform.mapFields, function (mapField){
                                    if (!_.isNull(mapField.leftSide)){
                                        scope.fieldForExpressionInCalculated.push({label: mapField.leftSide})
                                    }
                                });
                            }
                        });

                        // if (scope.dimensionsMetrics[field] == 'number' || scope.dimensionsMetrics[field] == 'decimal') {
                        //     angular.forEach(scope.dataSourceFields, function (item) {
                        //         if (!item || item == '') {
                        //             return;
                        //         }
                        //
                        //         if (scope.dimensionsMetrics[item] == 'number' || scope.dimensionsMetrics[item] == 'decimal') {
                        //             scope.fieldForExpression.push({label: item});
                        //         }
                        //     });
                        // } else {
                        //     angular.forEach(scope.dataSourceFields, function (item) {
                        //         if (!item || item == '') {
                        //             return;
                        //         }
                        //
                        //         scope.fieldForExpression.push({label: item});
                        //     });
                        // }

                        if (!!field && !!calculatedField) {
                            calculatedField.expression = null
                        }
                    }

                    scope.getPeopleText = function (item){
                        // note item.label is sent when the typedText wasn't found
                        return '[' + item.label + ']';
                    };

                    function filterFieldNameForSortBy(fields, item){
                        return function (field){
                            if (!angular.isArray(fields) || !angular.isObject(fields[0]) || !angular.isObject(fields[1])) {
                                return true
                            }

                            if (item.names.indexOf(field) > -1) {
                                return true
                            }

                            var findItem = _.find(fields, function (field){
                                return field.direction != item.direction;
                            });

                            if (findItem.names.indexOf(field) == -1) {
                                return true
                            }

                            return false
                        }
                    }

                    function addSpaceBeforeAndAfterOperator(field){
                        field = AddCalculatedField.addSpaceBeforeAndAfterOperator(field);
                        return field;
                    }

                    function getFiledFormatTypes(transforms, currentType){
                        var types = [];

                        angular.forEach(scope.allFiledFormatTypes, function (type){
                            if (type.key == 'augmentation' || type.key == 'date' || type.key == 'number' || type.key == currentType) {
                                types.push(type);
                                return;
                            }

                            var indexTrans = _.findIndex(transforms, function (transform){
                                return transform.type == type.key
                            });

                            if (indexTrans == -1) {
                                types.push(type);
                            }
                        });

                        return types;
                    }

                    function getDimensionsMetricsForAddField(fieldCurrent, transforms){
                        var fields = _getAllFieldInTransform(transforms);

                        return _.filter(scope.totalDimensionsMetrics, function (dm){
                            if (dm == fieldCurrent) {
                                return true;
                            }

                            for (var index in transforms) {
                                var transform = transforms[index];

                                if(transform.type == 'extractPattern' || transform.type == 'replaceText') {
                                    for(var indexField in transform.fields) {
                                        var field = transform.fields[indexField];

                                        if(field.isOverride) {
                                            if(dm == field.field) {
                                                return false
                                            }
                                        } else {
                                            if(dm == field.targetField) {
                                                return false
                                            }
                                        }
                                    }
                                }
                            }

                            return fields.indexOf(dm) == -1;
                        });
                    }

                    function getDimensionsMetricsForTextAddField(fieldCurrent, transforms){
                        var fields = _getAllFieldInTransform(transforms);

                        return _.filter(scope.totalDimensionsMetrics, function (dm){
                            if (dm == fieldCurrent) {
                                return true;
                            }

                            return fields.indexOf(dm) == -1 && (scope.dimensionsMetrics[dm] == 'text' || scope.dimensionsMetrics[dm] == 'multiLineText');
                        });
                    }

                    function getDimensionsMetricsForTextAddReplace(fieldCurrent, transformFields){
                        return _.filter(scope.totalDimensionsMetrics, function (dm){
                            if (dm == fieldCurrent) {
                                return true;
                            }

                            for (var index in transformFields) {
                                if (transformFields[index].field == dm) {
                                    return false
                                }
                            }

                            return scope.dimensionsMetrics[dm] == 'text' || scope.dimensionsMetrics[dm] == 'multiLineText';
                        });
                    }

                    function getTotalDimensionsMetricsForDefaultValues() {
                        //var fieldsOfTransform = _getAllFieldInTransform(scope.transforms);
                        //
                        //var fields =  _.filter(scope.totalDimensionsMetrics, function (dm){
                        //    return (fieldsOfTransform.indexOf(dm) > -1 || !notInMapField(dm)) && (scope.dimensionsMetrics[dm] == 'number' || scope.dimensionsMetrics[dm] == 'decimal');
                        //});

                        var fields = angular.copy(scope.dataSourceFields);
                        fields.unshift(CALCULATED_VALUE);

                        return fields;
                    }

                    function getDimensionsMetricsForNumberAddField(fieldCurrent, transforms){
                        var fields = _getAllFieldInTransform(transforms);

                        return _.filter(scope.totalDimensionsMetrics, function (dm){
                            if (dm == fieldCurrent) {
                                return true;
                            }

                            return fields.indexOf(dm) == -1 && (scope.dimensionsMetrics[dm] == 'number' || scope.dimensionsMetrics[dm] == 'decimal');
                        });
                    }

                    function getDimensionsMetricsForComparison(fieldCurrent, transforms){
                        var fields = _getAllFieldInTransform(transforms);

                        return _.filter(scope.totalDimensionsMetrics, function (dm){
                            if (dm == fieldCurrent) {
                                return true;
                            }

                            if (fields.indexOf(dm) == -1) {
                                if (scope.dimensionsMetrics[dm] == 'number' || scope.dimensionsMetrics[dm] == 'decimal') {
                                    return true
                                }
                            }

                            return false;
                        });
                    }

                    function getFieldNames(itemField, transformType){
                        var fields = _.filter(scope.fieldNames, function (fieldName){
                            if (itemField == fieldName) {
                                return true;
                            }

                            for (var index in scope.transforms) {
                                var filter = scope.transforms[index];

                                if (filter.field == fieldName) {
                                    return false
                                }
                            }

                            return true;
                        });

                        if(transformType == 'number') {
                            angular.forEach(scope.transforms, function (transform){
                                if (transform.type == 'addField' || transform.type == 'addCalculatedField' || transform.type == 'comparisonPercent') {
                                    angular.forEach(transform.fields, function (field){
                                        if (!!field.field && transform.type != 'addField') {
                                            fields.push(field.field);
                                        } else if(scope.dimensionsMetrics[field.field] == 'number' || scope.dimensionsMetrics[field.field] == 'decimal') {
                                            fields.push(field.field);
                                        }
                                    })
                                }
                            });
                        }

                        return _.uniq(fields)
                    }

                    function filerFieldNamesForComparisonPercent(){
                        var fields = [];

                        // angular.forEach(scope.fieldNames, function (field) {
                        angular.forEach(scope.dataSourceFields, function (field){
                            fields.push(field);
                            // if (scope.dimensionsMetrics[field] == 'number' || scope.dimensionsMetrics[field] == 'decimal') {
                            //     fields.push(field);
                            // }
                        });

                        return fields;
                    }

                    function selectTransformType(transform, type){
                        setTimeout(function (){
                            transform.field = null;
                            transform.fields = [];

                            if (type.key == scope.allFiledFormatTypeKeys.sortBy) {
                                transform.fields.push({names: [], direction: 'asc'}, {names: [], direction: 'desc'});
                            }

                            if (type.key == scope.allFiledFormatTypeKeys.subsetGroup) {
                                transform.groupFields = [];
                                transform.mapFields = [
                                    {leftSide: null, rightSide: null}
                                ];
                            }

                            if (type.key == scope.allFiledFormatTypeKeys.number) {
                                transform.decimals = 0;
                                transform.thousandsSeparator = ',';
                            }

                            if (type.key == scope.allFiledFormatTypeKeys.augmentation) {
                                transform.mapCondition = {
                                    leftSide: null,
                                    rightSide: null
                                };

                                transform.mapFields = [{
                                    leftSide: null,
                                    rightSide: null
                                }];

                                // {
                                //     field: null,
                                //         operator: null,
                                //     value: null
                                // }
                                transform.customCondition = [];

                                transform.mapDataSet = null;
                            }
                        }, 0);
                    }

                    function filterFieldByType(transform){
                        return function (field){
                            if (transform.type == 'date' && (scope.dimensionsMetrics[field] == 'date' || scope.dimensionsMetrics[field] == 'datetime')) {
                                return true;
                            }

                            if (transform.type == 'number' && (scope.dimensionsMetrics[field] == 'number' || scope.dimensionsMetrics[field] == 'decimal')) {
                                return true;
                            }

                            return false
                        };
                    }

                    function filterFieldByText(field){
                        return scope.dimensionsMetrics[scope.mapFields[field]] == 'text'
                            || scope.dimensionsMetrics[scope.mapFields[field]] == 'multiLineText'
                            || scope.dimensionsMetrics[field] == 'text'
                            || scope.dimensionsMetrics[field] == 'multiLineText'
                            || REPORT_VIEW_INTERNAL_FIELD_VARIABLE.indexOf(field) > -1;
                    }

                    function filterFieldByTextAndDate(field){
                        return scope.dimensionsMetrics[scope.mapFields[field]] == 'date'
                            || scope.dimensionsMetrics[scope.mapFields[field]] == 'dataTime'
                            || scope.dimensionsMetrics[field] == 'date'
                            || scope.dimensionsMetrics[field] == 'datetime'
                            || filterFieldByText(field);
                    }

                    function notInMapField(field){
                        for(var index in scope.transforms) {
                            var transform = scope.transforms[index];

                            if(transform.type == 'augmentation' || transform.type == 'subset-group') {
                                for(var indexMap in transform.mapFields) {
                                    if(transform.mapFields[indexMap].leftSide == field) {
                                        return false
                                    }
                                }
                            }
                        }

                        return _.values(scope.mapFields).indexOf(field) == -1;
                    }

                    function filterTextFields(field){
                        return scope.dimensionsMetrics[field] == 'text';
                    }

                    function filterNumberFields(field){
                        return ((scope.dimensionsMetrics[field] == 'number') || (scope.dimensionsMetrics[field] == 'decimal'));
                    }

                    // function textTypeFieldsAndNotInMapField(field) {
                    //     return _.values(scope.mapFields).indexOf(field) == -1;
                    // }

                    function removeTransform(index){
                        scope.transforms.splice(index, 1);
                    }

                    function addTransform(){
                        scope.transforms.push({
                            fields: [],
                            openStatus: true
                        });
                    }

                    function addComparisonPercent(fields){
                        fields.push({
                            field: null,
                            numerator: null,
                            denominator: null
                        });
                    }

                    function addField(fields){
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

                    function addReplaceText(fields){
                        fields.push({
                            field: null,
                            isOverride: false,
                            targetField: null,
                            searchFor: null,
                            position: null,
                            replaceWith: null
                        });
                    }

                    function addMapFields(fields) {
                        fields.push({
                            leftSide: null,
                            rightSide: null
                        });
                    }

                    function addCustomCondition(fields) {
                        fields.push({
                            field: null,
                            operator: null,
                            value: null,
                            dropUnmatched: false
                        });
                    }

                    function addExtractPattern(fields){
                        fields.push({
                            field: null,
                            isOverride: false,
                            targetField: null,
                            searchPattern: null
                        });
                    }

                    function filterFieldsForInputField(checkBoxValue, extractPattern){
                        var allMappedFiels = [];
                        _.each(scope.mapFields, function (value, key){
                            if (value) {
                                allMappedFiels.push(key);
                            }
                        });

                        if (checkBoxValue) {
                            scope.dataSourceFieldsCopy = _.filter(scope.dataSourceFields.concat(_getAllFieldInTransform(scope.transforms)), function (field){
                                if (-1 != _.indexOf(allMappedFiels, field)) {
                                    return true;
                                }
                                return false;
                            });
                            extractPattern.targetField = null;

                        } else {
                            scope.dataSourceFieldsCopy = angular.copy(scope.dataSourceFields).concat(_getAllFieldInTransform(scope.transforms));
                        }

                    }

                    function removeAddValue(fields, index){
                        fields.splice(index, 1);
                    }

                    function _getAllFieldInTransform(transforms){
                        var fields = [];
                        angular.forEach(transforms, function (transform){
                            if (transform.type == 'addField' || transform.type == 'addCalculatedField' || transform.type == 'comparisonPercent' || transform.type == 'addConcatenatedField') {
                                angular.forEach(transform.fields, function (field){
                                    if (!!field.field) {
                                        fields.push(field.field);
                                    }
                                })
                            }
                        });

                        return fields;
                    }

                    function _getTotalFieldDataSetInAugmentation(dataSetId) {
                        var dataSet = _.find(scope.listDataSets, function (dataSetItem) {
                            return dataSetItem.id == dataSetId
                        });

                        if(!!dataSet) {
                            return angular.extend(angular.copy(dataSet.dimensions), angular.copy(dataSet.metrics));
                        }

                        return []
                    }

                    directive || (directive = $compile(content));

                    element.append(directive(scope, function ($compile){
                        return $compile;
                    }));
                }
            }
        };
    }
})();