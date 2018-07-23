(function () {
    'use strict';

    angular
        .module('tagcade.unifiedReport.connect')
        .controller('NewValueForm', NewValueForm)
    ;

    function NewValueForm($scope, $modalInstance, Auth, value, dateUtil, dimensionsMetrics, dataSet, listValues, fields, transform, ReportViewAddConditionalTransformValues, COMPARISON_TYPES_ADD_FIELD_VALUE) {
        $scope.isNew = value == null;
        $scope.transform = transform;
        $scope.dimensionsMetrics = dimensionsMetrics;

        $scope.value = angular.copy(value) || {
            name: null,
            defaultValue: null,
            sharedConditions: [
                {
                    field: null,
                    comparator: null,
                    value: null
                }
            ],
            conditions: [
                {
                    expressions: [
                        {
                            field: null,
                            comparator: null,
                            value: null
                        }
                    ],
                    value: null
                }
            ]
        };

        var isAdmin = Auth.isAdmin();

        if($scope.isNew && isAdmin) {
            var publisher = angular.isObject(dataSet) ? dataSet.publisher : {};
            $scope.value.publisher =  angular.isObject(publisher) ? publisher.id : publisher;
        }

        $scope.conditionComparators = COMPARISON_TYPES_ADD_FIELD_VALUE;
        $scope.fields = fields;
        $scope.formProcessing = false;

        $scope.datePickerOptsFoot = {
            "drops": "up"
        };

        $scope.submit = submit;
        $scope.isFormValid = isFormValid;
        $scope.removeAddValue = removeAddValue;
        $scope.addCondition = addCondition;
        $scope.addConditionExpression = addConditionExpression;
        $scope.addCompareValue = addCompareValue;
        $scope.selectedComparison = selectedComparison;
        $scope.filterConditionComparators = filterConditionComparators;
        $scope.selectedField = selectedField;
        $scope.setPattern = setPattern;

        function setPattern(type) {
            if(type == 'number') {
                return '^[0-9]*$'
            }

            if(type == 'decimal') {
                return '^[0-9]+([,.][0-9]+)?$';
            }

            return ''
        }

        function selectedField(expression) {
            expression.comparator = null;
            expression.value = null;
        }

        function filterConditionComparators(defaultValue) {
            return function (separator) {
                if(!defaultValue.field || (defaultValue.field.indexOf('__') > -1 && (defaultValue.field.indexOf('_day') > -1 || defaultValue.field.indexOf('_month') > -1 || defaultValue.field.indexOf('_year') > -1) && separator.key == 'between')) {
                    return false
                }

                if(!dimensionsMetrics[defaultValue.field] && separator.key == 'between') {
                    return true
                }

                if(dimensionsMetrics[defaultValue.field] != 'date' && dimensionsMetrics[defaultValue.field] != 'datetime' && separator.key == 'between') {
                    return false
                }

                var type = (defaultValue.field.indexOf('__') > -1 && (defaultValue.field.indexOf('_day') > -1 || defaultValue.field.indexOf('_month') > -1 || defaultValue.field.indexOf('_year') > -1)) ? 'number' : dimensionsMetrics[defaultValue.field];

                if(separator.types.indexOf(type) == -1) {
                    return false
                }

                return true;
            }
        }

        function selectedComparison(defaultValue) {
            if(!!defaultValue) {
                defaultValue.value = null;
            }
        }

        function addCompareValue(query) {
            // if (!/^[+-]?\d+(\.\d+)?$/.test(query)) {
            //     return;
            // }

            return query;
        }

        function submit() {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            $scope.formProcessing = true;

            delete $scope.value.createdDate;

            angular.forEach($scope.value.sharedConditions, function (field) {
                if(field.comparator == 'between') {
                    field.value.startDate = dateUtil.getFormattedDate(field.value.startDate);
                    field.value.endDate = dateUtil.getFormattedDate(field.value.endDate);
                }
            });

            angular.forEach($scope.value.conditions, function (condition) {
                angular.forEach(condition.expressions, function (expression) {
                    if(expression.comparator == 'between') {
                        expression.value.startDate = dateUtil.getFormattedDate(expression.value.startDate);
                        expression.value.endDate = dateUtil.getFormattedDate(expression.value.endDate);
                    }
                });
            });

            var saveValue = $scope.isNew ? ReportViewAddConditionalTransformValues.post($scope.value) : ReportViewAddConditionalTransformValues.one($scope.value.id).patch($scope.value);

            saveValue
                .catch(
                    function (response) {
                        $modalInstance.close();
                    }
                )
                .then(
                    function (valueResp) {
                        if($scope.isNew) {
                            transform.values.push(valueResp.id);
                            listValues.push(valueResp);
                        } else {
                            value = angular.extend(value, $scope.value);
                        }

                        $modalInstance.close();
                    }
                )
            ;
        }

        function addConditionExpression(conditions) {
            conditions.push({
                expressions: [
                    {
                        field: null,
                        comparator: null,
                        value: null
                    }
                ],
                value: null
            })
        }

        function removeAddValue(fields, index){
            fields.splice(index, 1);
        }

        function addCondition(conditions) {
            conditions.push(
                {
                    field: null,
                    comparator: null,
                    value: null
                }
            );
        }

        function isFormValid() {
            return $scope.newValueForm.$valid
        }
    }
})();