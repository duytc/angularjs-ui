(function (){
    'use strict';

    angular.module('tagcade.unifiedReport.connect')
        .directive('transformConnect', transformConnect)
    ;

    function transformConnect($compile, $timeout, AddCalculatedField, _, connectedDataSourceService, CONNECT_TIMEZONES, CONVERT_CASE_TYPES, COMPARISON_TYPES_CALCULATED_DEFAULT_VALUE, REPORT_VIEW_INTERNAL_FIELD_VARIABLE, CONNECT_DATA_SOURCE_TYPE_FORMAT_ALL_FIELD, POSITIONS_FOR_REPLACE_TEXT, CONNECT_DATA_SOURCE_TYPE_FORMAT_ALL_FIELD_KEY, DATE_FORMAT_TYPES){
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
                reorderTransformsAllowed: '=',
                temporaryFields: '='
            },
            restrict: 'AE',
            templateUrl: 'unifiedReport/connectDataSource/directives/transformConnect.tpl.html',
            compile: function (element, attrs){
                var content, directive;
                content = element.contents().remove();
                return function (scope, element, attrs){
                    const CALCULATED_VALUE = {
                        key: '$$CALCULATED_VALUE$$',
                        label: 'Calculated Value'
                    };

                    scope.dataSourceFields = connectedDataSourceService.inputFormatDataSourceField(scope.dataSourceFields);
                    scope.totalDimensionsMetrics = connectedDataSourceService.inputFormatFieldDataSet(scope.totalDimensionsMetrics);
                    scope.temporaryFieldsFormat = connectedDataSourceService.inputFormatTemporaryFields(scope.temporaryFields);

                    scope.allFiledFormatTypes = CONNECT_DATA_SOURCE_TYPE_FORMAT_ALL_FIELD;
                    scope.allFiledFormatTypeKeys = CONNECT_DATA_SOURCE_TYPE_FORMAT_ALL_FIELD_KEY;
                    scope.dateFormatTypes = DATE_FORMAT_TYPES;
                    scope.ConvertCaseTypes = CONVERT_CASE_TYPES;
                    scope.fieldForExpression = [];
                    scope.fieldForExpressionInCalculated = [];
                    scope.positionsForReplaceText = POSITIONS_FOR_REPLACE_TEXT;
                    scope.dataSourceFieldsCopy = angular.copy(scope.dataSourceFields).concat(_getAllFieldInTransform());
                    scope.reorderDefaultValueAllowed = false;

                    scope.separatorType = [
                        {key: ',', label: 'Comma'},
                        {key: 'none', label: 'None'}
                    ];

                    scope.timezones = CONNECT_TIMEZONES;

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

                    scope.fieldNames = connectedDataSourceService.inputFormatFieldDataSet(_.isArray(scope.mapFields) ? scope.mapFields : _.union(_.values(scope.mapFields)));

                    scope.totalFields = {
                        dimensionsMetricsForDefaultValues: [],
                        dataSourceFieldsAllFieldTransform: [],
                        dataSourceFieldsAllFieldTransformAndFieldVariable: [],
                        totalDimensionsMetricsAndTemporaryFields: angular.copy(scope.totalDimensionsMetrics).concat(scope.temporaryFieldsFormat),
                        totalFieldForGroupBy: _getFieldForGroupBy(scope.transforms),
                        totalFieldForTypeDate: [],
                        totalFieldForTypeNumber: [],
                        totalDimensionsMetricsForAddField: [],
                        totalDataSourceFieldsAugmentationLeftSide: []
                    };

                    scope.$watch(function (){
                        return scope.mapFields;
                    }, function (){
                        scope.fieldNames = connectedDataSourceService.inputFormatFieldDataSet(_.isArray(scope.mapFields) ? scope.mapFields : _.union(_.values(scope.mapFields)));

                        _updateTransform();
                        _getDimensionsMetricsForDefaultValues();
                        _removeFieldInTransform();
                    }, true);

                    scope.$watch(function (){
                        return scope.transforms;
                    }, function (){
                        selectTypeAddCalculatedField();
                        _updateTransform();

                        _updateTotalField();
                        _removeFieldInTransform();
                    }, true);

                    scope.$watch(function (){
                        return scope.temporaryFields
                    }, function (){
                        scope.temporaryFieldsFormat = connectedDataSourceService.inputFormatTemporaryFields(scope.temporaryFields);

                        scope.totalFields.totalDimensionsMetricsAndTemporaryFields = angular.copy(scope.totalDimensionsMetrics).concat(scope.temporaryFieldsFormat);

                        _updateTotalField();
                        _removeFieldInTransform();
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
                    scope.addConvertCase = addConvertCase;
                    scope.addNormalizeText = addNormalizeText;
                    scope.addCalculatedField = addCalculatedField;
                    scope.addReplaceText = addReplaceText;
                    scope.addMapFields = addMapFields;
                    scope.addCustomCondition = addCustomCondition;
                    scope.removeAddValue = removeAddValue;
                    scope.addComparisonPercent = addComparisonPercent;
                    scope.notInMapField = notInMapField;
                    scope.notInMapFieldAndShowFieldCurrent = notInMapFieldAndShowFieldCurrent;
                    scope.mapDataSourceField = mapDataSourceField;
                    scope.filterFieldByText = filterFieldByText;
                    scope.selectTransformType = selectTransformType;
                    scope.getFieldNames = getFieldNames;
                    scope.getDimensionsMetricsForNormalizeText = getDimensionsMetricsForNormalizeText;
                    scope.getDimensionsMetricsForConvertCase = getDimensionsMetricsForConvertCase;
                    scope.getDimensionsMetricsForNumberAddField = getDimensionsMetricsForNumberAddField;
                    scope.getFiledFormatTypes = getFiledFormatTypes;
                    scope.filterFieldNameForSortBy = filterFieldNameForSortBy;
                    scope.addSpaceBeforeAndAfterOperator = addSpaceBeforeAndAfterOperator;
                    scope.selectTypeAddField = selectTypeAddField;
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
                    scope.filterForComparison = filterForComparison;
                    scope.selectCustomFormatDate = selectCustomFormatDate;
                    scope.getTransformName = getTransformName;
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
                    // scope.getFieldForLeftSideAugmentation = getFieldForLeftSideAugmentation;
                    scope.filterTarget = filterTarget;
                    scope.checkOverride = checkOverride;
                    scope.selectFieldNormalizeAndConvert = selectFieldNormalizeAndConvert;
                    scope.disabledOverride = disabledOverride;
                    scope.clickUseExternalDate = clickUseExternalDate;
                    scope.addFromFormat = addFromFormat;
                    scope.filterFieldByType = filterFieldByType;
                    scope.filterTargetFieldForExtractPattern = filterTargetFieldForExtractPattern;
                    scope.showFieldCurrentAndNotShowExist = showFieldCurrentAndNotShowExist;
                    scope.notShowCurrentField = notShowCurrentField;
                    scope.notShowFieldExistInTransforms = notShowFieldExistInTransforms;
                    scope.mapDataSourceFieldForMapFieldRightSide = mapDataSourceFieldForMapFieldRightSide;
                    scope.filterFieldByTextAndNumber = filterFieldByTextAndNumber;
                    scope.selectMapFieldLeftSideSubsetGroup = selectMapFieldLeftSideSubsetGroup;
                    scope.filterLeftSideAugmentation = filterLeftSideAugmentation;
                    scope.showDateToFormat = showDateToFormat;

                    function showDateToFormat(transform, $select) {
                        if(scope.dimensionsMetrics[transform.field] == 'datetime') {
                            return moment().format('YYYY-MM-DD H:mm:ss') + ' ('+ transform.to +')'
                        }

                        return $select.selected.label
                    }

                    function filterLeftSideAugmentation(transform) {
                        return function (field) {
                            if(!!transform.mapFields && transform.mapFields.indexOf(field.key) > -1) {
                                return false
                            }

                            return true
                        }
                    }

                    function selectMapFieldLeftSideSubsetGroup(mapField) {
                        mapField.rightSide = null;
                    }

                    function mapDataSourceFieldForMapFieldRightSide(mapField) {
                        return function (field) {
                            if(mapDataSourceField(field.original)) {
                                if(!scope.dimensionsMetrics[mapField.leftSide]) {
                                    return true
                                }

                                return scope.dimensionsMetrics[mapField.leftSide] == scope.dimensionsMetrics[scope.mapFields[field.original]];
                            }

                            return false;
                        }
                    }

                    function notShowCurrentField(currentField) {
                        return function (field) {
                            if(!!field && currentField == field.key) {
                                return false
                            }

                            return true
                        }
                    }

                    function showFieldCurrentAndNotShowExist(currentField) {
                        return function (field) {
                            if(field.key == currentField) {
                                return true
                            }

                            return filterFieldInTransformReplaceText(field);
                        }
                    }

                    function filterFieldByType(transform){
                        return function (field){
                            if(field.key == transform.field) {
                                return true
                            }

                            for(var index in scope.transforms) {
                                if(field.key == scope.transforms[index].field) {
                                    return false
                                }
                            }

                            return true
                        };
                    }

                    function addFromFormat(from) {
                        from.push({isCustomFormatDateFrom: false, format: null})
                    }

                    function clickUseExternalDate(field, useDate) {
                        $timeout(function () {
                            field.value = useDate ? '[__date]' : null;
                        }, 0, true)
                    }

                    function disabledOverride(field) {
                        var item = _.find(scope.totalFields.dataSourceFieldsAllFieldTransform, function (item) {
                            return !!item && item.key == field
                        });

                        if(!item) {
                            return true
                        }

                        for(var index in scope.transforms) {
                            var transform = scope.transforms[index];

                            if (transform.type == 'convertCase' || transform.type == 'normalizeText') {
                                var findField = _.findIndex(transform.fields, function (transformField) {
                                    return transformField.targetField == item.key && !transformField.isOverride
                                });

                                if(findField > -1) {
                                    return false
                                }
                            }
                        }

                        return !mapDataSourceField(item.original)
                    }

                    function selectFieldNormalizeAndConvert(field) {
                        setTimeout(function () {
                            var item = _.find(scope.totalFields.dataSourceFieldsAllFieldTransform, function (item) {
                                return !!item && item.key == field.field
                            });

                            if(!!item && _.keys(scope.mapFields).indexOf(item.original) == -1) {
                                field.isOverride = false
                            } else {
                                field.isOverride = true
                            }
                        }, 0);
                    }

                    function checkOverride(field) {
                        field.targetField = null
                    }

                    function filterTarget(currentField) {
                        return function (field) {
                            if(currentField == field.key) {
                                return true
                            }

                            for(var index in scope.transforms) {
                                var transform = scope.transforms[index];

                                if (transform.type == 'convertCase' || transform.type == 'normalizeText' || transform.type == 'extractPattern' || transform.type == 'replaceText') {
                                    var findField = _.findIndex(transform.fields, function (transformField) {
                                        return transformField.targetField == field.key && !transformField.isOverride
                                    });

                                    if(findField > -1) {
                                        return false
                                    }
                                }
                            }

                            return true
                        }
                    }

                    // function getFieldForLeftSideAugmentation(transform) {
                    //     var fields = scope.dataSourceFields;
                    //
                    //     for (var index in scope.transforms) {
                    //         var transformItem  = scope.transforms[index];
                    //
                    //         if(transformItem.type == 'augmentation' && transformItem.mapDataSet != transform.mapDataSet) {
                    //             angular.forEach(transformItem.mapFields, function (mapField) {
                    //                 if(!!mapField.leftSide) {
                    //                     fields.push(connectedDataSourceService.findField(mapField.leftSide));
                    //                 }
                    //             })
                    //         }
                    //     }
                    //
                    //     return fields
                    // }

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

                        if(!!scope.dimensionsMetrics[mapFieldThis.leftSide] && scope.dimensionsMetrics[mapFieldThis.leftSide] != totalField[mapFieldThis.rightSide]) {
                            mapFieldThis.rightSide = null;
                        }

                        return function (field){
                            if(!!mapFieldThis.leftSide && mapFieldThis.leftSide == field.key) {
                                return true
                            }

                            if(!notInMapField(field)) {
                                return false
                            }

                            for(var index in transform.mapFields) {
                                var mapField = transform.mapFields[index];

                                if(mapField.leftSide == field.key && mapFieldThis.leftSide != field.key) {
                                    return false
                                }
                            }

                            var item = _.find(_getAllFieldInTransform(), function (item) {
                                return item.key == field.key
                            });

                            if(!!item) {
                                return false
                            }

                            return true
                        };
                    }

                    function filterMapFieldRightSide(transform, mapFieldThis) {
                        return function (field){
                            if(!scope.dimensionsMetrics[mapFieldThis.leftSide]) {
                                return true
                            }

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

                    function selectCustomFormatDate(from) {
                        from.format = null;
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
                        var index = _.findIndex(REPORT_VIEW_INTERNAL_FIELD_VARIABLE, function (variable) {
                            return variable.key == field
                        });

                        return index > -1
                    }

                    function getDataSourceFieldsForReplace(checkBoxValue){
                        if (!(checkBoxValue)) {
                            return scope.totalFields.dataSourceFieldsAllFieldTransformAndFieldVariable
                        } else  {
                            return scope.totalFields.dataSourceFieldsAllFieldTransform
                        }
                    }

                    function resetFieldNameInReplaceTextTransform(checkBoxValue, replaceText){
                        if (checkBoxValue) {
                            var index = _.findIndex(REPORT_VIEW_INTERNAL_FIELD_VARIABLE, function (variable) {
                                return variable.key == replaceText.field
                            });

                            if (index > -1) {
                                replaceText.fieldValue =  undefined;
                            }
                        }

                        return replaceText;
                    }

                    function disableOverride(replaceText) {
                        var field = _.find(getDataSourceFieldsForReplace(replaceText.isOverride), function (item) {
                            return item.key == replaceText.field
                        });

                        if(!field) {
                            return false
                        }

                        var index = _.findIndex(REPORT_VIEW_INTERNAL_FIELD_VARIABLE, function (variable) {
                            return variable.key == field.key
                        });

                        if(!mapDataSourceField(field.original) || index > -1) {
                            replaceText.isOverride = false;

                            return true
                        }

                        return false;
                    }

                    function getDataSourceFieldsForExtractPattern() {
                        return scope.totalFields.dataSourceFieldsAllFieldTransformAndFieldVariable
                    }

                    function filterFieldInTransformExtractPattern(currentField) {
                        return function (field) {
                            if(currentField == field.key) {
                                return true
                            }

                            for (var index in scope.transforms) {
                                var transform = scope.transforms[index];

                                if(transform.type == 'addField' || transform.type == 'replaceText' || transform.type == 'extractPattern') {
                                    for(var indexField in transform.fields) {
                                        var fieldTransform = transform.fields[indexField];

                                        if(field.key == fieldTransform.field) {
                                            return false
                                        }

                                        if(field.key == fieldTransform.targetField) {
                                            return false
                                        }
                                    }
                                }
                            }

                            return true;
                        }
                    }

                    function filterFieldInTransformReplaceText(field) {
                        for (var index in scope.transforms) {
                            var transform = scope.transforms[index];

                            if (transform.type == 'addField' || transform.type == 'replaceText' || transform.type == 'extractPattern' || transform.type == 'comparisonPercent' || transform.type == 'addCalculatedField') {
                                for (var indexField in transform.fields) {
                                    var fieldTransform = transform.fields[indexField];

                                    if(transform.type == 'extractPattern' && field.key == fieldTransform.targetField) {
                                        return false
                                    }

                                    if(field.key == fieldTransform.field) {
                                        return false
                                    }
                                }
                            }
                        }

                        return true;
                    }

                    function formatExpressionToHighlight(field){
                        var name = _.find(scope.totalFields.totalDimensionsMetricsForAddField, function (item) {
                            return item.key == field.field
                        });

                        var expression = (!!name ? ('<strong>' + name.label + '</strong>' + ' = ') : '') + (angular.copy(field.expression) || angular.copy(field.value) || '');

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

                    function _getFieldForGroupBy(transforms){
                        var fieldInConcat = [];

                        angular.forEach(transforms, function (transform){
                            switch (transform.type) {
                                case 'addField':
                                    angular.forEach(transform.fields, function (field){
                                        if (!'field' in field) {
                                            return;
                                        }

                                        if (!_.isNull(field.field)){
                                            fieldInConcat.push(connectedDataSourceService.findField(field.field))
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
                                            fieldInConcat.push(connectedDataSourceService.findField(field.targetField))
                                        }
                                    });
                                    break;
                                case 'replaceText':
                                    angular.forEach(transform.fields, function (field){
                                        if (!'targetField' in field || !'isOverride' in field) {
                                            return;
                                        }

                                        if (!_.isNull(field.targetField) && !field.isOverride){
                                            fieldInConcat.push(connectedDataSourceService.findField(field.targetField))
                                        }
                                    });
                                    break;
                                case 'augmentation':
                                    angular.forEach(transform.mapFields, function (mapField){
                                        if (!_.isNull(mapField.leftSide)){
                                            fieldInConcat.push(connectedDataSourceService.findField(mapField.leftSide))
                                        }
                                    });
                                    break;
                                // case 'subsetGroup':
                                //     angular.forEach(transform.mapFields, function (mapField){
                                //         if (!_.isNull(mapField.leftSide)){
                                //             fieldInConcat.push(mapField.leftSide)
                                //         }
                                //     });
                                //     break;
                            }
                        });

                        return scope.dataSourceFields.concat(fieldInConcat);
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
                            scope.fieldForExpression.push(field);
                        });

                        angular.forEach(scope.dataSourceFields.concat(_getAllFieldInTransform()), function (item){
                            if (!item || item == '') {
                                return;
                            }

                            scope.fieldForExpression.push(item);
                        });

                        if (!!field && !!calculatedField) {
                            calculatedField.expression = null;
                            calculatedField.value = null
                        }
                    }

                    function selectTypeAddCalculatedField(field, calculatedField){
                        scope.fieldForExpressionInCalculated = [];

                        angular.forEach(scope.dataSourceFields, function (item){
                            if (!item || item == '') {
                                return;
                            }

                            scope.fieldForExpressionInCalculated.push(item);
                        });

                        angular.forEach(scope.transforms, function (transform) {
                            if(transform.type == 'addField' || transform.type == 'comparisonPercent') {
                                angular.forEach(transform.fields, function (field){
                                    if(!!field.field) {
                                        scope.fieldForExpressionInCalculated.push(connectedDataSourceService.findField(field.field));
                                    }
                                });
                            }

                            if(transform.type == 'subsetGroup' || transform.type == 'augmentation') {
                                angular.forEach(transform.mapFields, function (mapField){
                                    if (!_.isNull(mapField.leftSide)){
                                        if(mapField.leftSide) {
                                            scope.fieldForExpressionInCalculated.push(connectedDataSourceService.findField(mapField.leftSide))
                                        }
                                    }
                                });
                            }

                            if (transform.type == 'extractPattern') {
                                angular.forEach(transform.fields, function (field) {
                                    var item = field.isOverride ? field.field : field.targetField;

                                    if(!!item) {
                                        scope.fieldForExpressionInCalculated.push(connectedDataSourceService.findField(item));
                                    }
                                })
                            }

                            if (transform.type == 'addCalculatedField') {
                                angular.forEach(transform.fields, function (field) {
                                    if(!!field.field) {
                                        scope.fieldForExpressionInCalculated.push(connectedDataSourceService.findField(field.field));
                                    }
                                })
                            }
                        });

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

                            if (item.names.indexOf(field.key) > -1) {
                                return true
                            }

                            var findItem = _.find(fields, function (field){
                                return field.direction != item.direction;
                            });

                            if (findItem.names.indexOf(field.key) == -1) {
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

                    function _getDimensionsMetricsForAddField(){
                        return _.filter(scope.totalDimensionsMetrics, function (dm){
                            for (var index in scope.transforms) {
                                var transform = scope.transforms[index];

                                if(transform.type == 'extractPattern' || transform.type == 'replaceText') {
                                    for(var indexField in transform.fields) {
                                        var field = transform.fields[indexField];

                                        if(field.isOverride) {
                                            if(dm.key == field.field) {
                                                return false
                                            }
                                        } else {
                                            if(dm.key == field.targetField) {
                                                return false
                                            }
                                        }
                                    }
                                }
                            }

                            return true
                        });
                    }

                    function getDimensionsMetricsForNormalizeText(fieldCurrent, transform){
                        return _.filter(scope.totalFields.dataSourceFieldsAllFieldTransform, function (dm){
                            if (!!dm && dm.key == fieldCurrent) {
                                return true;
                            }

                            for (var index in transform.fields) {
                                if (!!dm && (transform.fields[index].field == dm.key || transform.fields[index].targetField == dm.key)) {
                                    return false
                                }
                            }

                            return true
                        });
                    }

                    function getDimensionsMetricsForConvertCase(fieldCurrent, transform){
                        return _.filter(scope.totalFields.dataSourceFieldsAllFieldTransform, function (dm){
                            if (!!dm && dm.key == fieldCurrent) {
                                return true;
                            }

                            for (var index in transform.fields) {
                                if (!!dm && (transform.fields[index].field == dm.key || transform.fields[index].targetField == dm.key)) {
                                    return false
                                }
                            }

                            return true
                        });
                    }

                    function _getDimensionsMetricsForDefaultValues() {
                        scope.totalFields.dimensionsMetricsForDefaultValues = angular.copy(scope.dataSourceFields);
                        scope.totalFields.dimensionsMetricsForDefaultValues.unshift(CALCULATED_VALUE);

                        for (var index in scope.transforms) {
                            var transformItem  = scope.transforms[index];

                            if(transformItem.type == 'subsetGroup') {
                                angular.forEach(transformItem.mapFields, function (mapField) {
                                    if(!!mapField.leftSide) {
                                        scope.totalFields.dimensionsMetricsForDefaultValues.push(connectedDataSourceService.findField(mapField.leftSide));
                                    }
                                })
                            }

                            if(transformItem.type == 'comparisonPercent') {
                                angular.forEach(transformItem.fields, function (field) {
                                    scope.totalFields.dimensionsMetricsForDefaultValues.push(connectedDataSourceService.findField(field.field));
                                })
                            }

                            if(transformItem.type == 'augmentation') {
                                angular.forEach(transformItem.mapFields, function (mapField) {
                                    if(!!mapField.leftSide) {
                                        scope.totalFields.dimensionsMetricsForDefaultValues.push(connectedDataSourceService.findField(mapField.leftSide));
                                    }
                                })
                            }

                            if (transformItem.type == 'extractPattern') {
                                angular.forEach(transformItem.fields, function (field) {
                                    var item = field.isOverride ? field.field : field.targetField;

                                    scope.totalFields.dimensionsMetricsForDefaultValues.push(connectedDataSourceService.findField(item));
                                })
                            }

                            if (transformItem.type == 'addCalculatedField') {
                                angular.forEach(transformItem.fields, function (field) {
                                    scope.totalFields.dimensionsMetricsForDefaultValues.push(connectedDataSourceService.findField(field.field));
                                })
                            }
                        }
                    }

                    function getDimensionsMetricsForNumberAddField(fieldCurrent, transforms){
                        var fields = _getAllFieldInTransform(transforms);

                        return _.filter(scope.totalDimensionsMetrics, function (dm){
                            if (!!fieldCurrent && dm.key == fieldCurrent) {
                                return true;
                            }

                            var index = _.findIndex(fields, function (field) {
                                return !!field && dm.key == field.key
                            });

                            return index == -1 && (scope.dimensionsMetrics[dm.original] == 'number' || scope.dimensionsMetrics[dm.original] == 'decimal');
                        });
                    }

                    function getFieldNames(transformType){
                        if(transformType == 'number') {
                            return scope.totalFields.totalFieldForTypeNumber
                        }

                        return scope.totalFields.totalFieldForTypeDate
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

                    function filterFieldByText(field){
                        if(!field || !field.original) {
                            return false
                        }

                        var indexVariable = _.findIndex(REPORT_VIEW_INTERNAL_FIELD_VARIABLE, function (variable) {
                            return variable.key == field.key
                        });

                        var indexTemp = _.findIndex(scope.temporaryFieldsFormat, function (temp) {
                            return temp.key == field.key
                        });

                        return scope.dimensionsMetrics[scope.mapFields[field.original]] == 'text'
                            || scope.dimensionsMetrics[scope.mapFields[field.original]] == 'largeText'
                            || scope.dimensionsMetrics[field.original] == 'text'
                            || scope.dimensionsMetrics[field.original] == 'largeText'
                            || indexVariable > -1
                            || indexTemp > -1;
                    }

                    function filterFieldByTextAndNumber(field){
                        if(!field || !field.original) {
                            return false
                        }

                        return scope.dimensionsMetrics[scope.mapFields[field.original]] == 'number'
                            || scope.dimensionsMetrics[scope.mapFields[field.original]] == 'decimal'
                            || scope.dimensionsMetrics[field.original] == 'number'
                            || scope.dimensionsMetrics[field.original] == 'decimal'
                            || filterFieldByText(field);
                    }

                    // function filterFieldByTextAndDate(field){
                    //     if(!field || !field.original) {
                    //         return false
                    //     }
                    //
                    //     return scope.dimensionsMetrics[scope.mapFields[field.original]] == 'date'
                    //         || scope.dimensionsMetrics[scope.mapFields[field.original]] == 'dataTime'
                    //         || scope.dimensionsMetrics[field.original] == 'date'
                    //         || scope.dimensionsMetrics[field.original] == 'datetime'
                    //         || filterFieldByText(field);
                    // }

                    function notShowFieldExistInTransforms(field) {
                        var item = _.find(_getAllFieldInTransform(), function (item) {
                            return !!item && !!field && item.key == field.key
                        });

                        return !item
                    }

                    function notInMapField(field){
                        for(var index in scope.transforms) {
                            var transform = scope.transforms[index];

                            if(transform.type == 'augmentation' || transform.type == 'subsetGroup') {
                                for(var indexMap in transform.mapFields) {
                                    if(transform.mapFields[indexMap].leftSide == field.key) {
                                        return false
                                    }
                                }
                            }
                        }

                        return _.values(scope.mapFields).indexOf(field.original) == -1;
                    }

                    function filterTargetFieldForExtractPattern(fieldCurrent) {
                        return function (field) {
                            if(fieldCurrent == field.key) {
                                return true;
                            }

                            var index = _.findIndex(scope.temporaryFieldsFormat, function (item) {
                                return item.key == field.key
                            });

                            if(index > -1) {
                                return true
                            }

                            return notInMapField(field)
                        }
                    }

                    function notInMapFieldAndShowFieldCurrent(fieldCurrent){
                        return function (field) {
                            if(fieldCurrent == field.key) {
                                return true;
                            }

                            return notInMapField(field)
                        }
                    }

                    function mapDataSourceField(field){
                        return _.keys(scope.mapFields).indexOf(field) > -1;
                    }

                    function filterTextFields(field){
                        return scope.dimensionsMetrics[field.original] == 'text';
                    }

                    function filterNumberFields(field){
                        return ((scope.dimensionsMetrics[field.original] == 'number') || (scope.dimensionsMetrics[field.original] == 'decimal'));
                    }

                    function filterForComparison(field){
                        return !scope.dimensionsMetrics[field.original] || (scope.dimensionsMetrics[field.original] == 'number') || (scope.dimensionsMetrics[field.original] == 'decimal');
                    }

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

                    function addConvertCase(fields){
                        fields.push({
                            field: null,
                            isOverride: true,
                            targetField: null,
                            type: null
                        });
                    }

                    function addNormalizeText(fields){
                        fields.push({
                            field: null,
                            isOverride: true,
                            targetField: null,
                            numberRemoved: false,
                            dashesRemoved: false,
                            alphabetCharacterRemoved: false
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

                    function _getAllFieldInTransform(){
                        var fields = [];

                        angular.forEach(scope.transforms, function (transform){
                            if (transform.type == 'addField' || transform.type == 'addCalculatedField' || transform.type == 'comparisonPercent' || transform.type == 'addConcatenatedField') {
                                angular.forEach(transform.fields, function (field){
                                    var index = _.findIndex(connectedDataSourceService, function (item) {
                                        return item.key == field.field
                                    });

                                    if (!!field.field && index == -1) {
                                        fields.push(connectedDataSourceService.findField(field.field));
                                    }
                                })
                            }

                            if (transform.type == 'convertCase' || transform.type == 'normalizeText') {
                                angular.forEach(transform.fields, function (field){
                                    if (!field.isOverride) {
                                        fields.push(connectedDataSourceService.findField(field.targetField));
                                    }
                                })
                            }

                            if (transform.type == 'extractPattern') {
                                angular.forEach(transform.fields, function (field){
                                    if (!field.isOverride) {
                                        var index = _.findIndex(connectedDataSourceService, function (item) {
                                            return item.key == field.targetField
                                        });

                                        if(index == -1){
                                            fields.push(connectedDataSourceService.findField(field.targetField));
                                        }
                                    } else {
                                        var indexField = _.findIndex(connectedDataSourceService, function (item) {
                                            return item.key == field.field
                                        });

                                        if(indexField == -1){
                                            fields.push(connectedDataSourceService.findField(field.field));
                                        }
                                    }
                                })
                            }
                        });

                        return fields;
                    }
                    
                    function _getAllFieldInAugmentationLeftSide() {
                        var fields = [];

                        for (var index in scope.transforms) {
                            var transformItem  = scope.transforms[index];

                            if(transformItem.type == 'augmentation') {
                                angular.forEach(transformItem.mapFields, function (mapField) {
                                    if(!!mapField.leftSide) {
                                        fields.push(connectedDataSourceService.findField(mapField.leftSide));
                                    }
                                })
                            }
                        }

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

                    function _updateTransform() {
                        angular.forEach(scope.transforms, function (transform) {
                            if (transform.type == 'convertCase' || transform.type == 'normalizeText') {
                                angular.forEach(transform.fields, function (field){
                                    var item = _.find(scope.totalFields.dataSourceFieldsAllFieldTransform, function (item) {
                                        return !!item && item.key == field.field
                                    });

                                    if(!!item && !mapDataSourceField(item.original)) {
                                        for(var index in scope.transforms) {
                                            var transformItem = scope.transforms[index];

                                            for(var indexField in transformItem.fields) {
                                                if(transformItem.fields[indexField].targetField == item.key && !!field.field) {
                                                    return;
                                                }
                                            }
                                        }

                                        field.isOverride = false
                                    }
                                })
                            }
                        })
                    }

                    function _getFieldForTypeNumber() {
                        var fields = _.filter(scope.fieldNames, function (fieldName){
                            if(scope.dimensionsMetrics[fieldName.original] != 'number' && scope.dimensionsMetrics[fieldName.original] != 'decimal') {
                                return false
                            }

                            return true;
                        });

                        angular.forEach(scope.transforms, function (transform){
                            if (transform.type == 'addField' || transform.type == 'addCalculatedField' || transform.type == 'comparisonPercent') {
                                angular.forEach(transform.fields, function (field){
                                    if (!!field.field && transform.type != 'addField') {
                                        fields.push(connectedDataSourceService.findField(field.field));
                                    } else if(scope.dimensionsMetrics[field.field] == 'number' || scope.dimensionsMetrics[field.field] == 'decimal') {
                                        fields.push(connectedDataSourceService.findField(field.field));
                                    }
                                })
                            }
                        });

                        return fields
                    }

                    function _getFieldForTypeDate() {
                        var fields =  _.filter(scope.fieldNames, function (fieldName){
                            if(scope.dimensionsMetrics[fieldName.original] != 'date' && scope.dimensionsMetrics[fieldName.original] != 'datetime') {
                                return false
                            }

                            return true;
                        });

                        angular.forEach(scope.transforms, function (transform){
                            if (transform.type == 'extractPattern') {
                                angular.forEach(transform.fields, function (field) {
                                    var item = field.isOverride ? field.field : field.targetField;

                                    if(scope.dimensionsMetrics[item] == 'date' || scope.dimensionsMetrics[item] == 'datetime') {
                                        fields.push(connectedDataSourceService.findField(item));
                                    }
                                })
                            }
                        });

                        return fields
                    }

                    function _updateTotalField() {
                        scope.totalFields.dataSourceFieldsAllFieldTransformAndFieldVariable = angular.copy(scope.dataSourceFields).concat(_getAllFieldInTransform()).concat(REPORT_VIEW_INTERNAL_FIELD_VARIABLE);
                        scope.totalFields.dataSourceFieldsAllFieldTransform  = angular.copy(scope.dataSourceFields).concat(_getAllFieldInTransform());
                        scope.totalFields.totalFieldForGroupBy = _getFieldForGroupBy(scope.transforms);

                        scope.totalFields.totalFieldForTypeNumber = _getFieldForTypeNumber(scope.transforms);
                        scope.totalFields.totalFieldForTypeDate = _getFieldForTypeDate(scope.transforms);
                        scope.totalFields.totalDimensionsMetricsForAddField = _getDimensionsMetricsForAddField().concat(scope.temporaryFieldsFormat);
                        scope.totalFields.totalDataSourceFieldsAugmentationLeftSide = scope.dataSourceFields.concat(_getAllFieldInAugmentationLeftSide());

                        _getDimensionsMetricsForDefaultValues();
                    }

                    function _removeFieldInTransform() {
                        $timeout(function () {

                            var transforms = angular.copy(scope.transforms);
                            var allFieldAdd = [];

                            // total field in targetField extractPattern
                            angular.forEach(transforms, function (transform) {
                                    angular.forEach(transform.fields, function (field) {
                                        if(transform.type == 'extractPattern') {
                                            allFieldAdd.push(field.targetField)
                                        }

                                        if(transform.type == 'addField' || transform.type == 'addCalculatedField' || transform.type == 'comparisonPercent') {
                                            allFieldAdd.push(field.field)
                                        }
                                    });
                                }
                            );

                            angular.forEach(transforms, function (transform) {
                                $timeout(function () {
                                    if((transform.type == 'number' || transform.type == 'date') && !!transform.field) {
                                        if(_.values(scope.mapFields).indexOf(transform.field) == -1 && allFieldAdd.indexOf(transform.field) == -1) {
                                            var index = _.findIndex(scope.transforms, function (item) {
                                                if(item.type == 'extractPattern') {
                                                    for (var indexField in item.fields) {
                                                        if(!item.fields[indexField].isOverride) {
                                                            return item.fields[indexField].targetField == transform.field
                                                        }
                                                    }
                                                }

                                                return item.field == transform.field;
                                            });

                                            if(index > -1) {
                                                scope.transforms.splice(index, 1)
                                            }
                                        }
                                    }
                                }, 0, true);
                            });

                            angular.forEach(scope.transforms, function (transform) {
                                if(transform.type == 'groupBy') {
                                    //var difference = _.difference(transform.fields, _.values($scope.connectDataSource.mapFields));
                                    //
                                    //if(difference.length > 0) {
                                    //    angular.forEach(difference, function (field) {
                                    //        if(transform.fields.indexOf(field) > -1) {
                                    //            transform.fields.splice(transform.fields.indexOf(field), 1)
                                    //        }
                                    //    });
                                    //}
                                }

                                // if(transform.type == 'sortBy') {
                                //     angular.forEach(transform.fields, function (field) {
                                //        var difference = _.difference(field.names, _.values($scope.connectDataSource.mapFields));
                                //
                                //        if(difference.length > 0) {
                                //            angular.forEach(difference, function (item) {
                                //                if(field.names.indexOf(item) > -1) {
                                //                    field.names.splice(field.names.indexOf(item), 1)
                                //                }
                                //            });
                                //        }
                                //     });
                                // }

                                if(transform.type == 'extractPattern' || transform.type == 'replaceText') {
                                    angular.forEach(transform.fields, function (transformField) {
                                        if(!transformField.isOverride) {
                                            var index = _.findIndex(scope.totalFields.totalDimensionsMetricsAndTemporaryFields, function (item) {
                                                return item.key == transformField.targetField
                                            });

                                            if(index == -1) {
                                                transformField.targetField = null
                                            }
                                        }
                                    })
                                }

                                if(transform.type == 'replaceText') {
                                    // angular.forEach(transform.fields, function (field) {
                                    //     if(Object.keys($scope.connectDataSource.mapFields).indexOf(field.field) == -1
                                    //         || ($scope.dimensionsMetrics[$scope.connectDataSource.mapFields[field.field]] != 'text'
                                    //         && $scope.dimensionsMetrics[$scope.connectDataSource.mapFields[field.field]] != 'largeText')) {
                                    //         $timeout(function () {
                                    //             field.field = null
                                    //         }, 0, true);
                                    //     }
                                    //
                                    //     if(Object.keys($scope.connectDataSource.mapFields).indexOf(field.targetField) > -1) {
                                    //         $timeout(function () {
                                    //             field.targetField = null
                                    //         }, 0, true);
                                    //     }
                                    // });
                                }

                                if(transform.type == 'comparisonPercent' || transform.type == 'addCalculatedField' || transform.type == 'addConcatenatedField') {
                                    angular.forEach(transform.fields, function (field) {
                                        if(_.values(scope.mapFields).indexOf(field.field) > -1) {
                                            $timeout(function () {
                                                field.field = null
                                            }, 0, true);
                                        }
                                    });
                                }

                                if(transform.type == 'addCalculatedField') {
                                    angular.forEach(transform.fields, function (field) {
                                        angular.forEach(field.defaultValues, function (defaultValue) {
                                            var index = _.findIndex(scope.totalFields.dimensionsMetricsForDefaultValues, function (item) {
                                                return item.key == defaultValue.conditionField
                                            });

                                            if(index == -1) {
                                                defaultValue.conditionField = null;
                                            }
                                        })
                                    })
                                }

                                if(transform.type == 'addField') {
                                    angular.forEach(transform.fields, function (field) {
                                        var item = _.find(scope.totalFields.totalDimensionsMetricsForAddField, function (item) {
                                            return item.key == field.field
                                        });

                                        if(!item || !notInMapField(item)) {
                                            field.field = null
                                        }
                                    });
                                }

                                var allFields = _getAllFieldInTransform().concat(scope.dataSourceFields);

                                if (transform.type == 'convertCase' || transform.type == 'normalizeText') {
                                    angular.forEach(transform.fields, function (field) {
                                        var indexTarget = _.findIndex(scope.transforms, function (transformItem) {
                                            if(transformItem.type == 'convertCase' || transformItem.type == 'normalizeText') {
                                                for(var index in transformItem.fields) {
                                                    var fieldItem = transformItem.fields[index];

                                                    if(!fieldItem.isOverride && fieldItem.targetField == field.field) {
                                                        return true
                                                    }
                                                }
                                            }

                                            return false
                                        });

                                        var indexAllField = _.findIndex(allFields, function (item) {
                                            return !!item && item.key == field.field
                                        });

                                        if(indexAllField == -1 && indexTarget == -1) {
                                            setTimeout(function () {
                                                field.field = null;
                                            }, 0);
                                        }
                                    });
                                }
                            });
                        }, 0, true)
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