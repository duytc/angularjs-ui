(function () {
    'use strict';

    angular.module('tagcade.unifiedReport.autoOptimization')
        .controller('autoOptimizationBuilder', autoOptimizationBuilder);

    function autoOptimizationBuilder($scope, _, $translate, publishers, auto, reportViewList,
                                     AutoOptimizationManager, AlertService, historyStorage, DATETIME_RANGE_OPTIONS,
                                     HISTORY_TYPE_PATH, UnifiedReportViewManager, OptimizationUtil) {

        const DEFAULT_WEIGHT = 0.5;
        const NUMBER = 'number';
        const DECIMAL = 'decimal';
        const _12HOURS = '-12 hours';


        AlertService.replaceAlerts({
            type: 'warning',
            message: $translate.instant("AUTO_OPTIMIZE_INTEGRATION_MODULE.GENERAL_MESSAGE_HELP")
        });
        $scope.sliderOptions = {
            min: 0,
            step: 0.01,
            max: 1
        };
        $scope.sliderInputOptions = {
            min: 0,
            step: 1,
            max: 100
        };
        $scope.current = {
            name: null,
            dateField: null,
            dateRange: null,
            identifierFields: [],
            optimizeFields: [],
            segmentFields: [],
            publisher: null,
            reportView: null,
            finishLoading: true
        };
        $scope.formData = {
            goals: [
                {key: 0, value: 'Maximize'},
                {key: 1, value: 'Minimize'}
            ],
            dateRanges: [
                // {key: 'Today', value: 'today'},
                // {key: 'Yesterday', value: 'yesterday'},
                {key: 'Last 7 Days', value: 'last 7 days'},
                {key: 'Last 30 Days', value: 'last 30 days'},
                {key: 'This Month', value: 'this month'},
                {key: 'Last Month', value: 'last month'},
                {key: 'Last 2 Months', value: 'last 2 months'},
                {key: 'Last 3 Months', value: 'last 3 months'}
            ],
            dimensions: [],
            dateFields: [],
            metrics: [],
            optimizeFieldsData: [],
            columnName: []
        };
        $scope.reportViewList = reportViewList;
        $scope.selected = {
            reportView: null
        };
        $scope.formData.dateFields = $scope.current.reportView ? getDateFields($scope.current.reportView) : [];

        $scope.publishers = publishers;
        $scope.formProcessing = false;
        $scope.isNew = auto === null;

        $scope.submit = submit;
        $scope.selectPublisher = selectPublisher;
        $scope.isFormSaveValid = isFormSaveValid;
        $scope.onSelectReportView = onSelectReportView;
        $scope.getMetrics = getMetrics;
        $scope.getDateFields = getDateFields;
        $scope.getDimensions = getDimensions;
        $scope.getOptimizeFieldsData = getOptimizeFieldsData;

        $scope.convertGoal = convertGoal;
        $scope.refactorOptimizationFields = refactorOptimizationFields;
        $scope.refactorSegmentFields = refactorSegmentFields;

        $scope.extractGoal = extractGoal;
        $scope.extractOptimizeFields = extractOptimizeFields;
        $scope.extractDateField = extractDateField;
        $scope.extractDateRange = extractDateRange;
        $scope.extractIdentifierFields = extractIdentifierFields;
        $scope.extractSegmentFields = extractSegmentFields;

        $scope.initEditData = initEditData;
        $scope.findGoal = findGoal;
        $scope.resetDataFollowReportView = resetDataFollowReportView;
        $scope.getListRerportView = getListReportView;

        if (!$scope.isNew) {
            $scope.initEditData(auto.plain());
        }

        /**
         * build optimize field to display on form
         * @param optimizeFields
         * @returns {Array}
         */
        function extractOptimizeFields(optimizeFields) {
            var refactorOptimizationFields = [];
            for (var index in optimizeFields) {
                for (var index2 in $scope.formData.optimizeFieldsData) {
                    if (optimizeFields[index].field == $scope.formData.optimizeFieldsData[index2].value) {
                        var found = $scope.formData.optimizeFieldsData[index2];
                        found.weight = optimizeFields[index].weight;
                        found.weight_input = Math.round(optimizeFields[index].weight * 100);
                        var goalValue = $scope.extractGoal(optimizeFields[index].goal);
                        found.goal = $scope.findGoal(goalValue);
                        refactorOptimizationFields.push($scope.formData.optimizeFieldsData[index2]);
                    }
                }
            }
            return refactorOptimizationFields;
        }

        /**
         * init data when edit
         * @param optimizationData
         */
        function initEditData(optimizationData) {
            $scope.current.name = optimizationData.name;
            $scope.current.publisher = optimizationData.publisher;

            $scope.reportViewList = optimizationData.reportViewList;
            $scope.current.reportView = optimizationData.reportView;
            $scope.onSelectReportView($scope.current.reportView);
            $scope.current.dateField = $scope.extractDateField(optimizationData.dateField);
            $scope.current.dateRange = $scope.extractDateRange(optimizationData.dateRange);
            $scope.current.id = optimizationData.id;
            $scope.current.identifierFields = $scope.extractIdentifierFields(optimizationData.identifierFields);
            $scope.current.segmentFields = $scope.extractSegmentFields(optimizationData.segmentFields);
            $scope.current.optimizeFields = $scope.extractOptimizeFields(optimizationData.optimizeFields);
            $scope.current.finishLoading = optimizationData.finishLoading;
        }

        function findGoal(value) {
            return $scope.formData.goals.find(function (goal) {
                return goal.value == value;
            })
        }

        function extractDateField(dateFieldValue) {
            return $scope.formData.dateFields.find(function (dateField) {
                return dateField.name == dateFieldValue;
            });
        }

        function extractDateRange(dateRangeValue) {
            var dateFieldIsDataTime = false;
            angular.forEach($scope.formData.dateFields, function (dateField) {
                if (dateField.type == 'datetime') {
                    dateFieldIsDataTime = true;
                }
            });

            if (dateFieldIsDataTime == true) {
                dateRangesSupportHours();
            }
            return $scope.formData.dateRanges.find(function (dateRange) {
                return dateRange.value == dateRangeValue;
            });
        }

        /**
         * build identifiers data for display on form
         * @param identifiers
         * @returns {Array}
         */
        function extractIdentifierFields(identifiers) {

            var extractedIdentifierFields = [];
            for (var index in identifiers) {
                for (var index2 in $scope.formData.dimensions) {
                    if (identifiers[index] == $scope.formData.dimensions[index2].value) {
                        extractedIdentifierFields.push($scope.formData.dimensions[index2])
                    }
                }
            }

            return extractedIdentifierFields;
        }

        /**
         * build segments data for display on form
         * @param segments
         * @returns {Array}
         */
        function extractSegmentFields(segments) {
            var extractedSegments = [];
            for (var index in segments) {
                for (var index2 in $scope.formData.dimensions) {
                    if (segments[index] == $scope.formData.dimensions[index2].value) {
                        extractedSegments.push($scope.formData.dimensions[index2])
                    }
                }
            }
            return extractedSegments;
        }

        /**
         * get list date fields from report view
         * @param reportView
         * @returns {Array}
         */
        function getDateFields(reportView) {
            var fieldTypesJson = reportView.fieldTypes;
            if (!fieldTypesJson) {
                return [];
            }
            var dateFields = [];
            for (var key in fieldTypesJson) {
                if (fieldTypesJson.hasOwnProperty(key)) {
                    if (fieldTypesJson[key] == 'date' || fieldTypesJson[key] == 'datetime') {
                        var json = {
                            name: key,
                            type: fieldTypesJson[key]
                        };
                        dateFields.push(json);
                    }
                }
            }

            /**
             * if field A join field B become A_B then show A_B only
             * @type {*}
             */
            var joinBys = reportView.joinBy;
            if (joinBys != null) {
                angular.forEach(joinBys, function (join) {
                    var joinFields = join.joinFields;
                    if (joinFields != null) {
                        angular.forEach(joinFields, function (joinField) {
                            var dataSetId = joinField.dataSet;
                            var field = joinField.field;
                            var key = field + '_' + dataSetId;
                            var found = _.find(dateFields, function (dateField) {
                                return dateField.name == key;
                            });
                            dateFields = _.without(dateFields, found);
                        })
                    }

                    var outputField = join.outputField;
                    var isVisible = join.isVisible;
                    if (!isVisible) {
                        var found = _.find(dateFields, function (dateField) {
                            return dateField.name == outputField;
                        });
                        dateFields = _.without(dateFields, found);
                    }
                })
            }

            /**
             * convert days_dataSetId -> days [data set name]
             */
            angular.forEach(dateFields, function (dateField) {
                if (!OptimizationUtil.isJoinField(dateField, reportView) && $scope.formData.columnName[dateField.name]) {
                    dateField['label'] = $scope.formData.columnName[dateField.name];
                } else {
                    dateField['label'] = dateField.name;
                }

            });

            return dateFields;
        }

        function getMetrics(metrics) {
            if (!metrics) {
                return [];
            }
            var metricsResult = [];
            for (var key in metrics) {
                var json = {
                    key: key,
                    value: metrics[key]
                };
                metricsResult.push(json);
            }
            return metricsResult;
        }

        function hasTypeDateOrDateTime(reportView, field) {
            var fieldTypes = reportView.fieldTypes;
            return fieldTypes[field] === 'date' || fieldTypes[field] === 'datetime';
        }
        function getDimensions(reportView) {
            var dimensions = reportView.dimensions;
            var dataSetList = reportView.reportViewDataSets;

            if (!dimensions) {
                return [];
            }
            var dimensionsResult = [];
            for (var key in dimensions) {
                if (hasTypeDateOrDateTime(reportView, dimensions[key]))
                    continue;

                var json = {
                    key: key,
                    value: dimensions[key],
                    label: OptimizationUtil.isJoinField(dimensions[key], reportView) || !$scope.formData.columnName[dimensions[key]]
                        ? dimensions[key]
                        : $scope.formData.columnName[dimensions[key]]
                };
                dimensionsResult.push(json);
            }
            return dimensionsResult;
        }

        $scope.onSelectOptimizeFields = function (item) {

            item.weight = DEFAULT_WEIGHT;
            item.weight_input = DEFAULT_WEIGHT * 100;
        };

        $scope.onDeSelectOptimizeFields = function (item, model) {
            for (var index in $scope.current.optimizeFields) {
                if ($scope.current.optimizeFields[index].key == item.key) {
                    $scope.current.optimizeFields[index].goal = $scope.formData.goals[0];
                    $scope.current.optimizeFields[index].weight = DEFAULT_WEIGHT;
                    $scope.current.optimizeFields[index].weight_input = $scope.current.optimizeFields[index].weight * 100;
                }
            }
        };

        $scope.onSelectDateFields = function (item) {
            //console.log(item);
            if (item.type == 'datetime') {
                var dateFieldIsDataTime = false;
                angular.forEach($scope.formData.dateRanges, function (dateRange) {
                    if (dateRange.value == _12HOURS) {
                        dateFieldIsDataTime = true;
                    }
                });
                if (dateFieldIsDataTime == false) {
                    dateRangesSupportHours();
                }
            } else {
                var needToDeleteHours = false;
                angular.forEach($scope.formData.dateRanges, function (dateRange) {
                    if (dateRange.value == _12HOURS) {
                        needToDeleteHours = true;
                    }
                });
                if (needToDeleteHours == true) {
                    $scope.formData.dateRanges.splice(0, DATETIME_RANGE_OPTIONS.length);
                    $scope.current.dateRange = '';
                }
            }
        };

        //watch the first time load dataFields to detect correct dateRange
        $scope.$watch($scope.current.dateField, function (newVal, oldVal) {
            $scope.onSelectDateFields($scope.current.dateField);
        })
        /*
         * support 12 hours and 24 hours in dateRanges if dataType dateField is datetime
         */
        function dateRangesSupportHours() {
            angular.forEach(DATETIME_RANGE_OPTIONS, function (option) {
                $scope.formData.dateRanges.unshift(option);
            });
        }

        function getOptimizeFieldsData(metrics, reportView) {
            var fieldTypes = reportView.fieldTypes;

            if (!metrics || !fieldTypes) {
                return [];
            }
            var optimizeFieldsResult = [];
            for (var index in metrics) {
                var field = metrics[index].value
                if (fieldTypes[field] == NUMBER || fieldTypes[field] == DECIMAL) {
                    var json = {
                        key: metrics[index].key,
                        value: metrics[index].value,
                        weight: 0,
                        goal: $scope.formData.goals[0],
                        label: OptimizationUtil.isJoinField(metrics[index].value, reportView)
                        || !$scope.formData.columnName[metrics[index].value]
                            ? metrics[index].value
                            : $scope.formData.columnName[metrics[index].value]
                    };
                    optimizeFieldsResult.push(json);
                }

            }
            return optimizeFieldsResult;
        }

        $scope.onSelectGoal = function (item) {
        };

        $scope.onStopSlider = function (event, value) {
            for (var index in $scope.current.optimizeFields) {
                $scope.current.optimizeFields[index].weight_input = Math.round($scope.current.optimizeFields[index].weight * 100);
            }
        };
        $scope.onChangeWeight = function () {
            for (var index in $scope.current.optimizeFields) {
                $scope.current.optimizeFields[index].weight = Number(parseFloat($scope.current.optimizeFields[index].weight_input / 100).toFixed(2));
            }
        };

        /**
         * update data after select a report view
         * @param reportView
         */
        function onSelectReportView(reportView) {
            resetDataFollowReportView();
            $scope.formData.columnName = OptimizationUtil.buildFieldsName(reportView);
            $scope.formData.dateFields = $scope.getDateFields(reportView);
            $scope.formData.metrics = $scope.getMetrics(reportView.metrics);
            $scope.formData.dimensions = $scope.getDimensions(reportView);
            $scope.formData.optimizeFieldsData = $scope.getOptimizeFieldsData($scope.formData.metrics, reportView);
        }

        function isArrayNullOrEmpty(array) {
            return array == null || array.length == 0 ? true : false;
        }

        function isStringNullOrEmpty(data) {
            return data == null || data.length == 0 ? true : false;
        }

        function isFormSaveValid() {
            if ($scope.current != null
                && !isStringNullOrEmpty($scope.current.name)
                && ($scope.current.publisher != null || $scope.isNew === true)
                && $scope.current.dateField != null
                && !isArrayNullOrEmpty($scope.current.identifierFields)
                && !isArrayNullOrEmpty($scope.current.optimizeFields)) {

                var isValid = true;
                for (var index in $scope.current.optimizeFields) {
                    if ($scope.current.optimizeFields[index].goal == null) {
                        isValid = false;
                        break;
                    }
                }
                return isValid;
            }
            return false;
        }

        function selectPublisher(publisher) {
            $scope.current.reportView = null;
            $scope.reportViewList = [];
            $scope.resetDataFollowReportView();
            var param = {
                "publisher": publisher.id
            };
            $scope.reportView = UnifiedReportViewManager.one().get(param)
                .then(function (reportViewList) {
                    if (reportViewList.records) {
                        $scope.reportViewList = reportViewList.records;
                    } else {
                        $scope.reportViewList = reportViewList;
                    }

                });
        }

        function getListReportView(publisherId) {
            var param = {
                "publisher": publisherId
            };
            $scope.reportView = UnifiedReportViewManager.one().get(param)
                .then(function (reportViewList) {
                    if (reportViewList.records) {
                        $scope.reportViewList = reportViewList.records;
                    } else {
                        $scope.reportViewList = reportViewList;
                    }
                });
        }

        function convertGoal(value) {
            return value === 'Maximize' ? 'Max' : 'Min';
        }

        function extractGoal(value) {
            return value === 'Max' ? 'Maximize' : 'Minimize';
        }

        function refactorOptimizationFields(optimizationFields) {
            var refactorOptimizationFields = [];
            angular.forEach(optimizationFields, function (optimization) {
                var json = {
                    "field": optimization.value,
                    "goal": convertGoal(optimization.goal.value),
                    "weight": optimization.weight
                };
                refactorOptimizationFields.push(json);
            });
            return refactorOptimizationFields;
        }

        function refactorSegmentFields(segmentFields) {
            var refactorSegments = [];
            angular.forEach(segmentFields, function (segment) {
                refactorSegments.push(segment.value);
            });
            return refactorSegments;
        }

        var refactorReportView = function (reportView) {
            if (reportView) {
                return reportView.id;
            }
            return null;
        };
        var refactorPublisher = function (publisher) {
            if (publisher) {
                return publisher.id;
            }
            return null;
        };

        var refactorJson = function (data) {
            var refactorData = angular.copy(data);
            refactorData.dateField = refactorData.dateField.name;
            refactorData.dateRange = refactorData.dateRange.value;
            refactorData.identifierFields = refactorIdentifierFields(refactorData.identifierFields);
            refactorData.optimizeFields = refactorOptimizationFields(refactorData.optimizeFields);
            refactorData.segmentFields = refactorSegmentFields(refactorData.segmentFields);
            if ($scope.isNew) {
                refactorData.reportView = refactorReportView(refactorData.reportView);
            }
            refactorData.publisher = refactorPublisher(refactorData.publisher);
            if (!$scope.isNew) {
                refactorData.id = refactorData.id;
            }

            return refactorData;
        };

        function refactorIdentifierFields(identifierFields) {
            var refactorIdentifierFields = [];
            angular.forEach(identifierFields, function (identifierField) {
                refactorIdentifierFields.push(identifierField.value);
            });
            return refactorIdentifierFields;

        }

        function resetDataFollowReportView() {
            $scope.current.dateField = null;
            $scope.current.dateRange = null;
            $scope.current.identifierFields = [];
            $scope.current.optimizeFields = [];
            $scope.current.segmentFields = [];
        }

        function submit() {
            if ($scope.formProcessing) {
                return;
            }
            $scope.formProcessing = true;
            var apiData = refactorJson($scope.current);

            if (!$scope.isAdmin()) {
                delete apiData.publisher;
            }
            var autoSave = $scope.isNew ? AutoOptimizationManager.post(apiData) : AutoOptimizationManager.one(apiData.id).patch(apiData);
            autoSave
                .then(function () {
                    AlertService.addFlash({
                        type: 'success',
                        message: $translate.instant('AUTO_OPTIMIZE_INTEGRATION_MODULE.UPDATE_SUCCESS_OPTIMIZATION_RULE')
                    });

                    return historyStorage.getLocationPath(HISTORY_TYPE_PATH.autoOptimization, '^.list');
                })
                .catch(function (response) {
                    $scope.formProcessing = false;
                    var message = _setMessageForSave(response);

                    AlertService.replaceAlerts({
                        type: 'error',
                        message: message
                    });
                });
        }

        function _setMessageForSave(response) {
            if (response.status == 500) {
                return $scope.isNew ? $translate.instant('AUTO_OPTIMIZE_INTEGRATION_MODULE.CREATE_NEW_FAIL_OPTIMIZATION_RULE') : $translate.instant('AUTO_OPTIMIZE_INTEGRATION_MODULE.UPDATE_FAIL_OPTIMIZATION_RULE')
            } else {
                return response.data.message
            }
        }
    }
})();