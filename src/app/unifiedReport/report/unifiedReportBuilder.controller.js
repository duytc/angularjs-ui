(function () {
    'use strict';

    angular.module('tagcade.unifiedReport.report')
        .controller('UnifiedReportBuilder', UnifiedReportBuilder);

    function UnifiedReportBuilder($scope, $timeout, $q, $translate, _, dataSets, publishers,editable, reportView, UnifiedReportViewManager, UserStateHelper, dateUtil, AlertService, historyStorage, HISTORY_TYPE_PATH) {
        $scope.editable = editable == true ? true : false;
        if(!$scope.editable){
            AlertService.replaceAlerts({
                type: 'warning',
                message: $translate.instant("AUTO_OPTIMIZE_INTEGRATION_MODULE.DISABLE_EDIT_REPORT_VIEW")
            });
        }
        /* [ hashKey: fieldName, ... ] */
        $scope.exchangeRateDateFields = [];
        $scope.transformsHashes = [];

        $scope.dataSets = dataSets;
        $scope.publishers = publishers;
        $scope.subView = !!reportView && reportView.subView;

        $scope.formProcessing = false;

        $scope.listDimensions = [];
        $scope.totalDimensionsMetrics = [];
        $scope.dimensionsMetrics = {};
        $scope.fieldInTransforms = {};
        $scope.selectedFields = [];
        $scope.summaryFieldTotal = [];
        $scope.fieldsHaveDateType = [];
        $scope.fieldsHaveNumberType = [];
        $scope.fieldNumberByMetrics = [];
        $scope.selectedAndAddedFieldsInTransform = [];

        $scope.isNew = reportView === null;
        if(!!reportView && reportView.subView && !$scope.isNew && angular.isObject(reportView.masterReportView)) {
            var masterReportView = angular.copy(reportView.masterReportView);
            masterReportView.filters = reportView.filters;
            delete  masterReportView.id;
            delete  masterReportView.subView;
            delete  masterReportView.masterReportView;
            delete  masterReportView.name;

            reportView = angular.extend(reportView, masterReportView);
        }

        $scope.reportBuilder = reportView || {
            publisher: null,
            reportViewDataSets: [
                {
                    filters: [],
                    dimensions: [],
                    metrics: [],
                    tempDimensions: [],
                    tempMetrics: [],
                    dimensionsMetrics: [],
                    fields: [],
                    dataSet: null
                }
            ],
            joinBy: [],
            weightedCalculations: [],
            transforms: [],
            formats: [],
            showInTotal: [],
            isShowDataSetName: false,
            largeReport: false,
            preCalculateTable: null,
            availableToChange: true,
            availableToRun: true,
            enableCustomDimensionMetric: true,
            filters: [],
            masterReportView: null,
            subView: false
        };

        $scope.aggregateAndAverage = {
            availableOptions: [
                {key:'aggregate',value:"Sum"},
                {key:'average',value:"Average"}
            ]
            //selectedOption: {key:'aggregate',value:"Sum"} //This sets the default value of the select in the ui
        };

        if(!$scope.reportBuilder.masterReportView && $scope.subView) {
            $scope.reportBuilder.masterReportView = $scope.subView ? reportView.id : null;
            $scope.reportBuilder.largeReport = false;
            $scope.reportBuilder.availableToChange = true;
            $scope.reportBuilder.availableToRun = true;
            $scope.reportBuilder.preCalculateTable = null;
            delete $scope.reportBuilder.id;
        }

        if(true) {
            var indexGroupBy = _.findIndex($scope.reportBuilder.transforms, function (transform) {
                return transform.type == 'groupBy'
            });

            if(indexGroupBy > -1) {
                $scope.reportBuilder.transforms[indexGroupBy].transformPosition = 'groupTransform'
            } else {
                $scope.reportBuilder.transforms.push({
                    transformPosition: 'groupTransform',
                    type: 'groupBy',
                    fields: [],
                    openStatus: true
                })
            }
        }

        $scope.$watch(function () {
            return $scope.reportBuilder.reportViewDataSets;
        }, watchDataSet, true);

        $scope.$watch(function () {
            return $scope.reportBuilder.transforms;
        }, updateSelectedAndAddedFieldsInTransform, true);

        $scope.$watch(function () {
            return $scope.reportBuilder.joinBy;
        }, watchDataSet, true);

        $scope.$watch(function () {
            return $scope.reportBuilder;
        }, summaryFieldForTotal, true);

        $scope.$watch(function () {
            return $scope.summaryFieldTotal;
        }, updateSelectedSummaryFieldTotal, true);

        $scope.getReports = getReports;
        $scope.saveReport = saveReport;
        $scope.isFormValid = isFormValid;
        $scope.selectPublisher = selectPublisher;
        $scope.hasFieldForTotal = hasFieldForTotal;
        $scope.toggleFieldForTotal = toggleFieldForTotal;
        $scope.isFormRunValid = isFormRunValid;
        $scope.isFormSaveValid = isFormSaveValid;

        $scope.getPeopleText = function (item) {
            // note item.label is sent when the typedText wasn't found
            return '[' + item.label + ']';
        };

        function isFormRunValid() {
            return isFormValid()
        }

        function isFormSaveValid() {
            return isFormValid() && !!$scope.reportBuilder.name
        }



        function hasFieldForTotal(filed) {

            // check field in showInTotal or not
            return $scope.reportBuilder.showInTotal.indexOf(filed.key) > -1;
        }

        function updateSelectedAndAddedFieldsInTransform() {
            $scope.selectedAndAddedFieldsInTransform = [];
            var fields = _getAllFieldInTransForm().concat($scope.selectedFields);
            angular.forEach(fields, function (metric) {
                var index = _.findIndex($scope.selectedAndAddedFieldsInTransform, function (field) {
                    return field.key == metric.key
                });

                if (index == -1) {
                    $scope.selectedAndAddedFieldsInTransform.push(metric);
                }
            });

            setTimeout(function () {
                _removeFieldNotSelectInFormat();
                _removeFieldNotSelectInTransform();
            }, 0);
        }

        function updateSelectedSummaryFieldTotal() {
            var showInTotal = angular.copy($scope.reportBuilder.showInTotal);

            angular.forEach(showInTotal, function (field) {
                var index = _.findIndex($scope.summaryFieldTotal, function (item) {
                    return item.key == field;
                });

                if (index == -1) {
                    var indexInTotal = $scope.reportBuilder.showInTotal.indexOf(field);

                    if (indexInTotal > -1) {
                        $scope.reportBuilder.showInTotal.splice(indexInTotal, 1)
                    }
                }
            })
        }

        function toggleFieldForTotal(field) {
            var showInTotal = angular.copy($scope.reportBuilder.showInTotal);
            var deletedFromShowInTotal = false;
            angular.forEach(showInTotal, function (showInTotalObject){
                var index = showInTotalObject.fields.indexOf(field.key);
                if (index > -1) {
                    // delete from array
                    if (showInTotalObject.type == 'aggregate') {
                        $scope.reportBuilder.showInTotal[0].fields.splice(index, 1);
                    } else {
                        $scope.reportBuilder.showInTotal[1].fields.splice(index, 1);
                    }
                    deletedFromShowInTotal = true;
                }
            });

            // add to array
            if (deletedFromShowInTotal == false) {
                if (!showInTotal || showInTotal.length === 0) {
                    var aggregate = {
                            "type":"aggregate",
                            "fields":[ field.key]
                        };
                    $scope.reportBuilder.showInTotal.push(aggregate);
                } else {
                    $scope.reportBuilder.showInTotal[0].fields.push(field.key);
                }
            }
        }

        /**
         * reset form report builder when select publisher
         * @param publisher
         */
        function selectPublisher(publisher) {
            _resetForm();
        }

        function unValidName(name) {
            var fields = [];

            angular.forEach(_getAllFieldInTransForm(), function (field) {
                fields.push(field.key);
            });

            return _.filter(fields, function(field){ return name == field && name != null; }).length > 1;
        }

        function isFormValid() {
            if ($scope.reportBuilder.transforms.length > 0) {
                for (var index in $scope.reportBuilder.transforms) {
                    var transform = $scope.reportBuilder.transforms[index];

                    if (transform.type == 'addField' || transform.type == 'addConditionValue' || transform.type == 'addCalculatedField' || transform.type == 'comparisonPercent') {
                        for (var fieldIndex in transform.fields) {
                            if(unValidName(transform.fields[fieldIndex].field)) {
                                return false
                            }
                        }
                    }

                    if (transform.type == 'sortBy') {
                        if (!angular.isArray(transform.fields) || !angular.isObject(transform.fields[0]) || !angular.isObject(transform.fields[1])) {
                            return false
                        }

                        if (transform.fields[0].names.length == 0 && transform.fields[1].names.length == 0) {
                            return false
                        }
                    }

                    // if (transform.type == 'groupBy' && transform.fields.length == 0) {
                    //     return false
                    // }
                }
            }

            if (!!$scope.reportBuilder.reportViewDataSets && $scope.reportBuilder.reportViewDataSets.length == 0) {
                return false
            }

            for (var index in $scope.reportBuilder.reportViewDataSets) {
                var dataSetItem = $scope.reportBuilder.reportViewDataSets[index];

                if (!dataSetItem.dataSet || (dataSetItem.dimensions.length == 0 && dataSetItem.metrics.length == 0)) {
                    return false
                }
            }

            if (angular.isArray($scope.reportBuilder.reportViewDataSets) && $scope.reportBuilder.reportViewDataSets.length > 1) {
                return !!$scope.reportBuilder.joinBy && $scope.unifiedBuilderForm.$valid
            }

            return $scope.unifiedBuilderForm.$valid;
        }

        function saveReport() {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            $scope.formProcessing = true;

            var reportBuilder = _refactorJson($scope.reportBuilder);
            delete reportBuilder.publisher;

            var reportViewSave = UnifiedReportViewManager.one(reportBuilder.id).patch(reportBuilder);
            reportViewSave
                .then(function () {
                    AlertService.addFlash({
                        type: 'success',
                        message: 'The report view has been updated'
                    });

                    return historyStorage.getLocationPath(HISTORY_TYPE_PATH.unifiedReportView, '^.listReportView');
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

        function getReports(save) {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            $scope.formProcessing = true;

            var reportBuilder = _refactorJson($scope.reportBuilder);

            var params = {
                reportViewDataSets: angular.toJson(reportBuilder.reportViewDataSets),
                filters: angular.toJson(reportBuilder.filters),
                transforms: angular.toJson(reportBuilder.transforms),
                showInTotal: angular.toJson(reportBuilder.showInTotal),
                weightedCalculations: angular.toJson(reportBuilder.weightedCalculations),
                formats: angular.toJson(reportBuilder.formats),
                joinBy: angular.toJson(reportBuilder.joinBy),
                name: reportBuilder.name,
                id: reportBuilder.id,
                masterReportView: reportBuilder.masterReportView,
                subView: reportBuilder.subView,
                fieldTypes: angular.toJson(reportBuilder.fieldTypes),
                isShowDataSetName: reportBuilder.isShowDataSetName,
                preCalculateTable: reportBuilder.preCalculateTable,
                largeReport: reportBuilder.largeReport,
                availableToRun: reportBuilder.availableToRun,
                availableToChange: reportBuilder.availableToChange,
                enableCustomDimensionMetric: reportBuilder.enableCustomDimensionMetric
            };

            if ($scope.isAdmin()) {
                params.publisher = reportBuilder.publisher.id || reportBuilder.publisher
            } else {
                delete reportBuilder.publisher
            }

            if (save) {
                var reportViewSave = (((!$scope.isNew && !$scope.subView) || angular.isObject($scope.reportBuilder.masterReportView))
                    ||  $scope.reportBuilder.masterReportView != $scope.reportBuilder.id)
                && !!reportBuilder.id ? UnifiedReportViewManager.one(reportBuilder.id).patch(reportBuilder) : UnifiedReportViewManager.post(reportBuilder);

                reportViewSave.then(function (data) {
                    if ($scope.isNew || !params.id || $scope.subView) {
                        params.id = !!data ? data.id : params.id || params.id;
                    }

                    if(data.largeReport && !data.availableToRun) {
                        AlertService.addFlash({
                            type: 'warning',
                            message: 'Please wait a few minutes for the changes to take effect.'
                        });

                        return historyStorage.getLocationPath(HISTORY_TYPE_PATH.unifiedReportView, '^.listReportView');
                    } else {
                        _viewDetail(params);
                    }

                    AlertService.addFlash({
                        type: 'success',
                        message: $scope.isNew ? 'The report view has been created' : 'The report view has been updated'
                    });
                }).catch(function (response) {
                    $scope.formProcessing = false;
                    var message = _setMessageForSave(response);

                    AlertService.replaceAlerts({
                        type: 'error',
                        message: message
                    });
                });
            } else {
                if($scope.subView) {
                    delete params.id;
                }

                _viewDetail(params);
            }
        }

        function _setMessageForSave(response) {
            if(response.status == 500) {
                return $scope.isNew ? "An error occurred. The report view could not be created" : "An error occurred. The report view could not be updated"
            } else {
                return response.data.message
            }
        }

        function _viewDetail(params) {
            var transition = UserStateHelper.transitionRelativeToBaseState(
                'unifiedReport.report.detail',
                params
            );

            $q.when(transition)
                .catch(function (error) {
                    AlertService.replaceAlerts({
                        type: 'error',
                        message: $translate.instant('REPORT.REPORT_FAIL')
                    });
                });
        }

        function watchDataSet() {
            $scope.totalDimensionsMetrics = [];
            $scope.listDimensions = [];
            $scope.dimensionsMetrics = {};
            $scope.selectedFields = [];
            $scope.fieldsHaveDateType = [];
            $scope.fieldsHaveNumberType = [];
            $scope.fieldNumberByMetrics = [];

            $scope.exchangeRateDateFields = [];

            var totalDimensions = [];

            angular.forEach($scope.reportBuilder.reportViewDataSets, function (item) {
                _setTotalDimensionsSelected(item);

                var dataSet = _.find($scope.dataSets, function (dataSet) {
                    return angular.isObject(item.dataSet) ? dataSet.id == item.dataSet.id : dataSet.id == item.dataSet;
                });

                if (!!dataSet) {
                    _setSelectedField(item, dataSet);

                    // save all dimensions of data set selected
                    totalDimensions.push(item.dimensions);
                    _setDimensionsMetrics(dataSet);
                    _setTotalDimensionsMetrics(dataSet);

                   $timeout(function () {
                       item.selectAllDimensionsMetrics = (item.dimensions.length == _.values(dataSet.dimensions).length && item.metrics.length == _.values(dataSet.metrics).length);
                   }, 0, true)
                }

                if($scope.reportBuilder.reportViewDataSets.length > 1) {
                    if(!$scope.reportBuilder.joinBy || $scope.reportBuilder.joinBy.length == 0) {
                        $scope.reportBuilder.joinBy = [
                            {
                                joinFields: [
                                    {dataSet: null, field: null, allFields: []},
                                    {dataSet: null, field: null, allFields: []}
                                ],
                                outputField: null,
                                isVisible: true
                            }
                        ]
                    }
                } else {
                    $scope.reportBuilder.joinBy = [];
                }
            });

            // set dataset in joinBy is null when dataset in reportBuilder is null
            if($scope.reportBuilder.reportViewDataSets.length > 1) {
                angular.forEach($scope.reportBuilder.joinBy, function (itemJoinBy) {
                    angular.forEach(itemJoinBy.joinFields, function (joinField) {
                        var itemDataSet = _.find($scope.reportBuilder.reportViewDataSets, function (reportViewDataSet) {
                            return reportViewDataSet.dataSet == joinField.dataSet || reportViewDataSet.dataSet.id == joinField.dataSet
                        });

                        if(!itemDataSet) {
                            joinField.dataSet = null;
                        } else {
                            var reportViewDataSet = _.find($scope.reportBuilder.reportViewDataSets, function (reportViewDataSet) {
                                return reportViewDataSet.dataSet == joinField.dataSet || reportViewDataSet.dataSet.id == joinField.dataSet;
                            });

                            if(!!reportViewDataSet) {
                                joinField.allFields = reportViewDataSet.dimensions.concat(reportViewDataSet.metrics);
                            }
                        }
                    });
                });

                _removeFieldNotSelectInJoinBy();
            }

            //EXCHANGE DATE
            $scope.exchangeRateDateFields = _getDateFieldsFromDataSet();
            _updateFieldByJoin($scope.exchangeRateDateFields);
            //END EXCHANGE DATE
            updateFieldWhenSelectJoinBy();
            updateSelectedAndAddedFieldsInTransform();
            _fieldsHaveDateType();
            _fieldsHaveNumberType();
            _fieldNumberByMetrics();
            _removeFieldNotSelectInTransform();
            _removeFieldNotSelectInFormat();

            //EXCHANGE DATE
            $scope.exchangeRateDateFields = _concatWithFieldsHaveDateType($scope.exchangeRateDateFields, $scope.fieldsHaveDateType);
            //END EXCHANGE DATE
        }

        function _updateFieldByJoin(dimensionObjects) {
            if(!!$scope.reportBuilder.joinBy && $scope.reportBuilder.joinBy.length > 0) {
                angular.forEach($scope.reportBuilder.joinBy, function (itemJoinBy) {
                    angular.forEach(itemJoinBy.joinFields, function (field) {
                        var index = _.findIndex(dimensionObjects, function (item) {
                            return item.key === field.field + '_' + field.dataSet
                        });

                        var indexOutputField = _.findIndex(dimensionObjects, function (item) {
                            return item.key === itemJoinBy.outputField
                        });

                        if(index > -1 && indexOutputField === -1) {
                            dimensionObjects.push({
                                root: itemJoinBy.outputField,
                                key: itemJoinBy.outputField,
                                label: itemJoinBy.outputField,
                                type: dimensionObjects[index].type
                            });

                            dimensionObjects.splice(index, 1);
                        }
                        if(index > -1 && indexOutputField > -1) {
                            dimensionObjects.splice(index, 1);
                        }
                    })
                })
            }
        }
        function updateFieldWhenSelectJoinBy() {
            if(!!$scope.reportBuilder.joinBy && $scope.reportBuilder.joinBy.length > 0) {
                angular.forEach($scope.reportBuilder.joinBy, function (itemJoinBy) {
                    angular.forEach(itemJoinBy.joinFields, function (field) {
                        // update for selectedFields
                        var index = _.findIndex($scope.selectedFields, function (item) {
                            return item.key == field.field + '_' + field.dataSet
                        });

                        var indexOutputField = _.findIndex($scope.selectedFields, function (item) {
                            return item.key == itemJoinBy.outputField
                        });

                        if(index > -1 && indexOutputField == -1) {
                            // if(itemJoinBy.isVisible) {
                            if(true) {
                                $scope.selectedFields.push({
                                    root: itemJoinBy.outputField,
                                    key: itemJoinBy.outputField,
                                    label: itemJoinBy.outputField,
                                    type: $scope.selectedFields[index].type
                                });
                            }

                            $scope.selectedFields.splice(index, 1);
                        }

                        if(index > -1 && indexOutputField > -1) {
                            $scope.selectedFields.splice(index, 1);
                        }

                        // update for totalDimensionsMetrics
                        var j = _.findIndex($scope.totalDimensionsMetrics, function (item) {
                            return item.key == field.field + '_' + field.dataSet
                        });

                        var jOutputField = _.findIndex($scope.totalDimensionsMetrics, function (item) {
                            return item.key == itemJoinBy.outputField
                        });

                        if(j > -1 && jOutputField == -1) {
                            if(true) {
                            // if(itemJoinBy.isVisible) {
                                $scope.totalDimensionsMetrics.push({
                                    root: itemJoinBy.outputField,
                                    key: itemJoinBy.outputField,
                                    label: itemJoinBy.outputField,
                                    type: $scope.totalDimensionsMetrics[j].type
                                });
                            }

                            $scope.totalDimensionsMetrics.splice(j, 1);
                        }

                        if(j > -1 && jOutputField > -1) {
                            $scope.totalDimensionsMetrics.splice(j, 1);
                        }

                        // update for listDimensions
                        var z = _.findIndex($scope.listDimensions, function (item) {
                            return item.key == field.field + '_' + field.dataSet
                        });

                        var zOutputField = _.findIndex($scope.listDimensions, function (item) {
                            return item.key == itemJoinBy.outputField
                        });

                        if(z > -1 && zOutputField == -1) {
                            if(true) {
                                // if(itemJoinBy.isVisible) {
                                $scope.listDimensions.push({
                                    root: itemJoinBy.outputField,
                                    key: itemJoinBy.outputField,
                                    label: itemJoinBy.outputField,
                                    type: $scope.listDimensions[z].type
                                });
                            }

                            $scope.listDimensions.splice(z, 1);
                        }

                        if(z > -1 && jOutputField > -1) {
                            $scope.listDimensions.splice(z, 1);
                        }

                        var xOutputField = _.find($scope.totalDimensionsMetrics, function (item) {
                            return item.key == itemJoinBy.outputField
                        });

                        if(!!xOutputField) {
                            $scope.dimensionsMetrics[itemJoinBy.outputField] = xOutputField.type
                        }
                    })
                });
            }
        }

        function summaryFieldForTotal() {
            $scope.summaryFieldTotal = [];
            var oldSummaryFieldTotalObject = angular.copy($scope.summaryFieldTotalObject);
            $scope.summaryFieldTotalObject = [];
            //console.log(oldSummaryFieldTotalObject);
            angular.forEach(_getAllFieldInTransForm().concat($scope.selectedFields), function (dm) {
                // Some fields are configured before. Reload it.
                if (oldSummaryFieldTotalObject) {
                    var found = oldSummaryFieldTotalObject.find(function (old) {
                        return old.key === dm.key;
                    });
                }
                if (found) $scope.summaryFieldTotal.push(dm);
                // Some new fields that are not configured
                else {
                    if (!!dm && (dm.type == 'number' || dm.type == 'decimal')) {
                        if (!!dm.key && dm.key.indexOf('__') == -1 && (dm.key.indexOf('_day') == -1 || dm.key.indexOf('_month') == -1 || dm.key.indexOf('_year') == -1)) {
                            var join = _.find($scope.reportBuilder.joinBy, {outputField: dm.key});

                            if (!!join && !join.isVisible) {
                                return
                            }

                            $scope.summaryFieldTotal.push(dm);
                        }
                    }
                }
            });
            //reset field
            $scope.fieldsHaveDateType = [];
            $scope.fieldsHaveNumberType = [];
            $scope.fieldNumberByMetrics = [];

            _fieldsHaveDateType();
            _fieldsHaveNumberType();
            _fieldNumberByMetrics();
            _removeFieldNotSelectInFormat();

            var showInTotal = angular.copy($scope.reportBuilder.showInTotal);
            if (!showInTotal) {
                angular.forEach($scope.summaryFieldTotal, function (field){
                    var availableOption = {
                        label: field.label,
                        key: field.key,
                        checked: false,
                        type: $scope.aggregateAndAverage.availableOptions[0]
                    };
                    $scope.summaryFieldTotalObject.push(availableOption);
                });
            } else {
                angular.forEach($scope.summaryFieldTotal, function (field){
                    var insertedToSummaryFieldTotalObject = false;
                    angular.forEach(showInTotal, function (showInTotalObject){
                        if (showInTotalObject.fields) {
                            if (showInTotalObject.fields.indexOf(field.key) > -1) {
                                var typeOption = $scope.aggregateAndAverage.availableOptions[0]
                                if (showInTotalObject.type == 'aggregate') {
                                    typeOption = $scope.aggregateAndAverage.availableOptions[0];
                                } else {
                                    typeOption = $scope.aggregateAndAverage.availableOptions[1]
                                }
                                var availableOption = {
                                    label: field.label,
                                    key: field.key,
                                    checked: true,
                                    type: typeOption
                                };
                                $scope.summaryFieldTotalObject.push(availableOption);
                                insertedToSummaryFieldTotalObject = true;
                            }
                        }

                    });

                    if (insertedToSummaryFieldTotalObject == false) {
                        var availableOption = {
                            label: field.label,
                            key: field.key,
                            checked: false,
                            type: $scope.aggregateAndAverage.availableOptions[0]
                        };
                        $scope.summaryFieldTotalObject.push(availableOption);
                    }
                });
            }
        }

        function _concatWithFieldsHaveDateType(exchangeRateDateFields, fieldsHaveDateType) {
            var integrationFields = angular.copy(exchangeRateDateFields);
            var extraFields = angular.copy(fieldsHaveDateType);

            angular.forEach(extraFields, function (extraFieldObject) {
                var foundIndex = _.findIndex(integrationFields, function (item) {
                    return item.key === extraFieldObject.key
                });
                if(foundIndex < 0 ){
                    integrationFields.push(extraFields[foundIndex]);
                }
            });

            return integrationFields;
        }

        function _fieldsHaveDateType() {
            var fields = _getAllFieldInTransForm().concat($scope.selectedFields);
            angular.forEach(fields, function (metric) {
                if (metric.type == 'date' || metric.type == 'datetime') {
                    var index = _.findIndex($scope.fieldsHaveDateType, function (field) {
                        return field.key == metric.key
                    });

                    if (index == -1) {
                        $scope.fieldsHaveDateType.push(metric);
                    }
                }
            });
        }

        function _getDataSetById(dataSetId) {
            return $scope.dataSets.find(function (dataSet) {
                return dataSet.id == dataSetId;
            })
        }

        function _getDateFieldsFromDataSet() {
            var dateFields = [];
            angular.forEach($scope.reportBuilder.reportViewDataSets, function (dataSet) {
                var dateField = {
                    key: null,
                    label: null,
                    root: null,
                    type: null
                };
                var originalDataSet = _getDataSetById(dataSet.dataSet);

                if (originalDataSet && originalDataSet.dimensions) {
                    var keys = Object.keys(originalDataSet.dimensions);
                    angular.forEach(keys, function (dimension) {
                        var type = originalDataSet.dimensions[dimension];
                        if (type === 'date') {
                            dateField.type = 'date';
                            dateField.key = dimension + '_' + originalDataSet.id;
                            dateField.label = dimension + '(' + originalDataSet.name + ')';
                            dateField.root = dimension;

                            dateFields.push(dateField);
                        } else if (type === 'datetime') {
                            dateField.type = 'datetime';
                            dateField.key = dimension + '_' + originalDataSet.id;
                            dateField.label = dimension + '(' + originalDataSet.name + ')';
                            dateField.root = dimension;

                            dateFields.push(dateField);
                        }
                    })
                }
            });

            return dateFields;
        }
        function _fieldsHaveNumberType() {
            var fields = _getAllFieldInTransForm().concat($scope.selectedFields);

            angular.forEach(fields, function (metric) {
                if (!!metric && (metric.type == 'number' || metric.type == 'decimal')) {
                    if(!!metric.key && metric.key.indexOf('__') == -1 && (metric.key.indexOf('_day') == -1 || metric.key.indexOf('_month') == -1 || metric.key.indexOf('_year') == -1)) {
                        var index = _.findIndex($scope.fieldsHaveNumberType, function (field) {
                            return field.key == metric.key
                        });

                        if (index == -1) {
                            $scope.fieldsHaveNumberType.push(metric)
                        }
                    }
                }
            });
        }

        function _fieldNumberByMetrics() {
            var fields = $scope.selectedFields;

            angular.forEach(fields, function (metric) {
                if (!!metric && (metric.type == 'number' || metric.type == 'decimal')) {
                    if(!!metric.key && metric.key.indexOf('__') == -1 && (metric.key.indexOf('_day') == -1 || metric.key.indexOf('_month') == -1 || metric.key.indexOf('_year') == -1)) {
                        var index = _.findIndex($scope.fieldNumberByMetrics, function (field) {
                            return field.key == metric.key
                        });

                        if (index == -1) {
                            $scope.fieldNumberByMetrics.push(metric)
                        }
                    }
                }
            });
        }


        function _getAllFieldInTransForm() {
            var fieldsTransForm = [];
            angular.forEach($scope.reportBuilder.transforms, function (transform) {
                if (transform.type == 'addField' || transform.type == 'addConditionValue' || transform.type == 'addCalculatedField' || transform.type == 'comparisonPercent') {
                    angular.forEach(transform.fields, function (field) {
                        if (!!field.field) {
                            var oldField = null;
                            // check if same $$hashKey
                            // get oldField for remove from $scope.transformsHashes
                            if ($scope.transformsHashes.indexOf(field['$$hashKey'] > -1)) {
                                oldField = $scope.transformsHashes[field['$$hashKey']];
                            }

                            // update
                            if (!!field['$$hashKey']) {
                                $scope.transformsHashes[field['$$hashKey']] = field.field;
                            }

                            // remove oldField from $scope.fieldInTransforms if has
                            if (!!oldField) {
                                delete $scope.fieldInTransforms[oldField];
                            }

                            // add new
                            $scope.fieldInTransforms[field.field] = field.type;

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

                if (transform.type == 'replaceText') {
                    angular.forEach(transform.fields, function (field) {
                        if (!field.isOverride) {
                            $scope.fieldInTransforms[field.targetField] = $scope.dimensionsMetrics[field.field];

                            fieldsTransForm.push({
                                label: field.targetField,
                                key: field.targetField,
                                root: field.targetField,
                                type: $scope.dimensionsMetrics[field.field],
                                transformType: transform.type
                            });
                        }
                    })
                }
            });

            return fieldsTransForm;
        }

        function _refactorJson(reportBuilder) {
            reportBuilder = angular.copy(reportBuilder);
            reportBuilder.fieldTypes = angular.extend(angular.copy($scope.dimensionsMetrics), $scope.fieldInTransforms);
            reportBuilder.masterReportView = angular.isObject(reportBuilder.masterReportView) ? reportBuilder.masterReportView.id : reportBuilder.masterReportView;

            var indexGroupBy = _.findIndex(reportBuilder.transforms, {type: 'groupBy'});

            if(indexGroupBy > -1) {
                var transform = reportBuilder.transforms[indexGroupBy];

                if(transform.fields.length == 0) {
                    reportBuilder.transforms.splice(indexGroupBy, 1);
                }
            }

            angular.forEach(reportBuilder.reportViewDataSets, function (item) {
                angular.forEach(item.filters, function (filter) {
                    if (filter.type == 'date') {
                        if (filter.dateType == 'customRange' || filter.dateType == 'userProvided') {
                            filter.dateValue.startDate = dateUtil.getFormattedDate(filter.dateValue.startDate);
                            filter.dateValue.endDate = dateUtil.getFormattedDate(filter.dateValue.endDate);
                        }

                        delete filter.date;
                        delete filter.comparison;
                        delete filter.compareValue;
                    }
                    if (filter.type == 'number') {
                        delete filter.date;
                        delete filter.startDate;
                        delete filter.endDate;
                        delete filter.format;
                        delete filter.dateValue;
                    }
                    if (filter.type == 'text') {
                        delete filter.date;
                        delete filter.startDate;
                        delete filter.endDate;
                        delete filter.format;
                        delete filter.dateValue;
                    }
                });

                angular.forEach(item.filters, function (filter) {
                    if(!filter.filterOld && $scope.subView) {
                        filter.dataSet = angular.isObject(item.dataSet) ? item.dataSet.id : item.dataSet;
                        reportBuilder.filters.push(filter);
                    }
                });

                item.filters = _.filter(item.filters, function (filter) {
                    return !filter.dataSet
                });

                delete item.id;
                delete item.tempDimensions;
                delete item.tempMetrics;
                delete item.fields;
                delete item.allFields;
                delete item.dimensionsMetrics;
                delete item.selectAllDimensionsMetrics;
            });

            angular.forEach(reportBuilder.transforms, function (transform) {
                delete transform.openStatus;
                transform.isPostGroup = transform.transformPosition == 'postGroupTransforms';
                delete transform.transformPosition;

                if (transform.type == 'date' || transform.type == 'number') {
                    delete transform.fields;
                } else {
                    delete transform.field;
                }

                if (transform.type == 'groupBy') {
                    delete transform.isPostGroup;
                }

                if (transform.type == 'addField') {
                    angular.forEach(transform.fields, function (field) {
                        if (field.type == 'decimal' || field.type == 'number') {
                            field.value = Number(field.value);
                        }

                        angular.forEach(field.conditions, function (condition) {
                            angular.forEach(condition.expressions, function (expression) {
                                if(expression.cmp == 'between') {
                                    expression.val.startDate = dateUtil.getFormattedDate(expression.val.startDate);
                                    expression.val.endDate = dateUtil.getFormattedDate(expression.val.endDate);
                                }
                            })
                        })
                    })

                }

                if (transform.type == 'addCalculatedField' || transform.type == 'postAggregation') {
                    angular.forEach(transform.fields, function (field) {
                        if(field.exchangeRateDateField){
                            field.exchangeRateDateField = field.exchangeRateDateField.key;
                        }

                        angular.forEach($scope.totalDimensionsMetrics, function replace(dm) {
                            if (!field.expression || !angular.isString(field.expression)) {
                                return;
                            }

                            if(dm.label == dm.key) {
                                return
                            }

                            var regExp = new RegExp(dm.label.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"), "g");
                            field.expression = field.expression.replace(regExp, dm.key);
                        });

                        angular.forEach(field.defaultValues, function (defaultValue) {
                            if(defaultValue.conditionComparator == 'between') {
                                defaultValue.conditionValue.startDate = dateUtil.getFormattedDate(defaultValue.conditionValue.startDate);
                                defaultValue.conditionValue.endDate = dateUtil.getFormattedDate(defaultValue.conditionValue.endDate);
                            }
                        })
                    })

                }
            });

            angular.forEach(reportBuilder.joinBy, function (join) {
                angular.forEach(join.joinFields, function (field) {
                    if(!reportBuilder.fieldTypes[join.outputField]) {
                        reportBuilder.fieldTypes[join.outputField] = reportBuilder.fieldTypes[field.field + '_' + field.dataSet];
                    }

                    delete field.allFields
                });
            });

            angular.forEach(reportBuilder.reportViewDataSets, function (reportViewDataSet) {
                reportViewDataSet.dataSet = angular.isObject(reportViewDataSet.dataSet) ? reportViewDataSet.dataSet.id : reportViewDataSet.dataSet
            });

            // reset show In Total based on type (aggregate and average)
            var aggreagteField = [];
            var averageField = [];
            angular.forEach($scope.summaryFieldTotalObject, function (summaryObject) {

                if (summaryObject.checked == true) {

                    if (summaryObject.type.key == 'aggregate') {
                        aggreagteField.push(summaryObject.key);
                    } else {
                        averageField.push(summaryObject.key);
                    }
                }
            });

            reportBuilder.showInTotal = [];
            if (aggreagteField != []) {
                var aggreagteFieldJson = {
                    "type":"aggregate",
                    "fields": aggreagteField
                };
                reportBuilder.showInTotal.push(aggreagteFieldJson);
            }
            if (averageField != []) {
                var averageFieldJson = {
                    "type":"average",
                    "fields": averageField
                };
                reportBuilder.showInTotal.push(averageFieldJson);
            }

            delete  reportBuilder.userReorderTransformsAllowed;
            delete  reportBuilder.dimensions;
            delete  reportBuilder.metrics;
            delete  reportBuilder.createdDate;
            delete  reportBuilder.lastActivity;
            delete  reportBuilder.lastRun;
            delete  reportBuilder.shared;
            delete  reportBuilder.createdDate;

            delete  reportBuilder.alias;
            delete  reportBuilder.subReportsIncluded;
            delete  reportBuilder.multiView;
            delete  reportBuilder.reportViewMultiViews;

            return reportBuilder;
        }

        function _resetForm() {
            $scope.reportBuilder.reportViewDataSets = [
                {
                    filters: [],
                    dimensions: [],
                    metrics: [],
                    tempDimensions: [],
                    tempMetrics: [],
                    dimensionsMetrics: [],
                    fields: []
                }
            ];

            $scope.reportBuilder.joinBy = [];
            $scope.reportBuilder.formats = [];
            $scope.reportBuilder.transforms = [{
                transformPosition: 'groupTransform',
                type: 'groupBy',
                fields: [],
                openStatus: true
            }];
            $scope.reportBuilder.weightedCalculations = [];
            $scope.reportBuilder.showInTotal = [];
            $scope.reportBuilder.isShowDataSetName = false;
            $scope.reportBuilder.largeReport = false;
            $scope.reportBuilder.preCalculateTable = null;
            $scope.reportBuilder.availableToRun = true;
            $scope.reportBuilder.availableToChange = true;
            $scope.reportBuilder.enableCustomDimensionMetric = true;
        }

        /**
         * selectedFields = [{label: 'field (Data Set ID 1)', key: 'field_dataSetId', root: ''field}]
         * @param item
         * @param dataSetItem
         * @private
         */
        function _setSelectedField(item, dataSetItem) {
            var allFields = angular.extend(angular.copy(dataSetItem.dimensions), angular.copy(dataSetItem.metrics));

            angular.forEach(item.fields, function (field) {
                var dataSet = _.find($scope.dataSets, function (dataSet) {
                    return dataSet.id == item.dataSet || dataSet.id == item.dataSet.id;
                });

                $scope.selectedFields.push({
                    label: field + ' (' + dataSet.name + ')',
                    key: field + '_' + (angular.isObject(item.dataSet) ? item.dataSet.id : item.dataSet),
                    root: field,
                    type: allFields[field]
                });
            });
        }

        /**
         * $scope.totalDimensionsMetrics = [{label: 'field (Data Set ID 1)', key: 'field_dataSetId', root: ''field}]
         * @param dataSet
         * @private
         */
        function _setTotalDimensionsMetrics(dataSet) {
            var allFields = angular.extend(angular.copy(dataSet.dimensions), angular.copy(dataSet.metrics));

            angular.forEach(allFields, function (type, field) {
                $scope.totalDimensionsMetrics.push({
                    label: field + ' (' + dataSet.name + ')',
                    key: field + '_' + dataSet.id,
                    root: field,
                    type: type
                });

                if(type == 'date' || type == 'datetime') {
                    var _year = {
                        label: '__' + field + '_year' + ' (' + dataSet.name + ')',
                        key: '__' + field + '_year' + '_' + dataSet.id,
                        root: '__' + field + '_year',
                        type: 'number'
                    };

                    var _day = {
                        label: '__' + field + '_day' + ' (' + dataSet.name + ')',
                        key: '__' + field + '_day' + '_' + dataSet.id,
                        root: '__' + field + '_day',
                        type: 'number'
                    };

                    var _month = {
                        label: '__' + field + '_month' + ' (' + dataSet.name + ')',
                        key: '__' + field + '_month' + '_' + dataSet.id,
                        root: '__' + field + '_month',
                        type: 'number'
                    };


                    $scope.totalDimensionsMetrics.push(_year);
                    $scope.selectedFields.push(_year);

                    $scope.totalDimensionsMetrics.push(_month);
                    $scope.selectedFields.push(_month);

                    $scope.totalDimensionsMetrics.push(_day);
                    $scope.selectedFields.push(_day);
                }
            });
        }

        /**
         * $scope.listDimensions = [{label: 'field (Data Set ID 1)', key: 'field_dataSetId', root: ''field}]
         * @param item
         * @private
         */
        function _setTotalDimensionsSelected(item) {
            angular.forEach(item.dimensions, function (field) {
                var dataSet = _.find($scope.dataSets, function (dataSet) {
                    return dataSet.id == item.dataSet || dataSet.id == item.dataSet.id;
                });

                $scope.listDimensions.push({
                    label: field + ' (' + dataSet.name + ')',
                    key: field + '_' + dataSet.id,
                    root: field
                })
            });
        }

        /**
         * $scope.dimensionsMetrics = {key_dataSetId: 'type'}, use for transform
         * @param dataSet
         * @private
         */
        function _setDimensionsMetrics(dataSet) {
            var allFields = angular.extend(angular.copy(dataSet.dimensions), angular.copy(dataSet.metrics));

            angular.forEach(allFields, function (type, key) {
                $scope.dimensionsMetrics[key + '_' + dataSet.id] = type;
            });

        }

        function _removeFieldNotSelectInTransform() {
            var transforms = angular.copy($scope.reportBuilder.transforms);

            angular.forEach(transforms, function (transform) {
                if (transform.type == 'date' || transform.type == 'number') {
                    var hasIndex = _.findIndex($scope.selectedFields, function (fieldSelect) {
                        return fieldSelect.key == transform.field
                    });

                    if (hasIndex == -1) {
                        var index = _.findIndex($scope.reportBuilder.transforms, function (item) {
                            return item.field == transform.field;
                        });

                        if (index > -1) {
                            $scope.reportBuilder.transforms.splice(index, 1)
                        }
                    }
                }
            });

            var selectedFields = [];

            angular.forEach($scope.selectedAndAddedFieldsInTransform, function (selectedField) {
                selectedFields.push(selectedField.key)
            });

            angular.forEach($scope.reportBuilder.transforms, function (transform) {
                if (transform.type == 'groupBy') {
                    var difference = _.difference(transform.fields, _.values(selectedFields));

                    if (difference.length > 0) {
                        angular.forEach(difference, function (field) {
                            if (transform.fields.indexOf(field) > -1) {
                                transform.fields.splice(transform.fields.indexOf(field), 1)
                            }
                        });
                    }
                }

                if (transform.type == 'sortBy') {
                    angular.forEach(transform.fields, function (field) {
                        var difference = _.difference(field.names, _.values(selectedFields));

                        if (difference.length > 0) {
                            angular.forEach(difference, function (item) {
                                if (field.names.indexOf(item) > -1) {
                                    field.names.splice(field.names.indexOf(item), 1)
                                }
                            });
                        }
                    });
                }

                if(transform.type == 'replaceText') {
                    angular.forEach(transform.fields, function (field) {
                        if(_.values(selectedFields).indexOf(field.field) == -1) {
                            $timeout(function () {
                                field.field = null
                            }, 0, true);
                        }
                    });
                }

                if (transform.type == 'addField') {
                    angular.forEach(transform.fields, function (field) {
                        angular.forEach(field.conditions, function (condition) {
                            angular.forEach(condition.expressions, function (expression) {
                                var field = _.find($scope.totalDimensionsMetrics, function (dm) {
                                    return dm.key == expression.var;
                                });

                                if (!field) {
                                    expression.var = null
                                }
                            })
                        })
                    });
                }

                if (transform.type == 'addCalculatedField') {
                    angular.forEach(transform.fields, function (field) {
                        angular.forEach(field.defaultValues, function (defaultValue) {
                            var field = _.find($scope.totalDimensionsMetrics, function (dm) {
                                return dm.key == defaultValue.conditionField;
                            });

                            if (!field && defaultValue.conditionField != '$$CALCULATED_VALUE$$') {
                                defaultValue.conditionField = null
                            }
                        })
                    });
                }

                if (transform.type == 'comparisonPercent') {
                    // angular.forEach(transform.fields, function (field) {
                    //     if (_.values(selectedFields).indexOf(field.denominator) == -1) {
                    //         field.denominator = null
                    //     }
                    //
                    //     if (_.values(selectedFields).indexOf(field.numerator) == -1) {
                    //         field.numerator = null
                    //     }
                    // });
                }
            });
        }

        // function _setTempDimensions(item, reportView) {
        //     if(!item || !item.dimensions) {
        //         return
        //     }
        //
        //     reportView.tempDimensions = [];
        //     angular.forEach(item.dimensions, function (dimension) {
        //         var key = null;
        //         var id = null;
        //
        //         if(dimension.lastIndexOf('_') > -1) {
        //             key = dimension.slice(0, dimension.lastIndexOf('_'));
        //             id = dimension.slice(dimension.lastIndexOf('_') + 1, dimension.length);
        //         } else {
        //             key = dimension;
        //         }
        //
        //         var dataSet = _.find($scope.dataSets, function (dataSet) {
        //             return !!dataSet.dimensions[key] && dataSet.id == id;
        //         });
        //
        //         if (!!dataSet) {
        //             reportView.tempDimensions.push({
        //                 key: dimension,
        //                 label: key + ' (' + dataSet.name + ')',
        //                 type: dataSet.dimensions[key],
        //                 root: key,
        //                 dataSet: dataSet
        //             })
        //         } else {
        //             reportView.tempDimensions.push({
        //                 key: dimension,
        //                 root: key,
        //                 label: dimension,
        //                 type: item.fieldTypes[dimension]
        //             })
        //         }
        //     });
        // }
        //
        // function _setTempMetrics(item, reportView) {
        //     if(!item || !item.metrics) {
        //         return
        //     }
        //
        //     reportView.tempMetrics = [];
        //     angular.forEach(item.metrics, function (metric) {
        //         var key = null;
        //         var id = null;
        //
        //         if(metric.lastIndexOf('_') > -1) {
        //             key = metric.slice(0, metric.lastIndexOf('_'));
        //             id = metric.slice(metric.lastIndexOf('_') + 1, metric.length);
        //         } else {
        //             key = metric;
        //         }
        //
        //         var dataSet = _.find($scope.dataSets, function (dataSet) {
        //             return !!dataSet.metrics[key] && dataSet.id == id;
        //         });
        //
        //         if (!!dataSet) {
        //             reportView.tempMetrics.push({
        //                 key: metric,
        //                 label: key + ' (' + dataSet.name + ')',
        //                 type: dataSet.metrics[key],
        //                 root: key,
        //                 dataSet: dataSet
        //             })
        //         } else {
        //             reportView.tempMetrics.push({
        //                 key: metric,
        //                 root: key,
        //                 label: metric,
        //                 type: item.fieldTypes[metric]
        //             })
        //         }
        //     });
        // }

        function _removeFieldNotSelectInFormat() {
            angular.forEach($scope.reportBuilder.formats, function (format) {
                var fields = [];
                if (format.type == 'date' || format.type == 'datetime') {
                    fields = $scope.fieldsHaveDateType;
                } else if (format.type == 'number' || format.type == 'decimal') {
                    fields = $scope.fieldsHaveNumberType;
                } else {
                    fields = $scope.selectedAndAddedFieldsInTransform;
                }

                var fieldSelect = [];
                angular.forEach(fields, function (field) {
                    fieldSelect.push(field.key)
                });

                var difference = _.difference(format.fields, _.values(fieldSelect));

                if (difference.length > 0) {
                    angular.forEach(difference, function (field) {
                        if (format.fields.indexOf(field) > -1) {
                            format.fields.splice(format.fields.indexOf(field), 1)
                        }
                    });
                }
            });
        }

        function _removeFieldNotSelectInJoinBy() {
            var selectedFields = [];

            angular.forEach($scope.reportBuilder.reportViewDataSets, function (dataSet) {
                var fields = dataSet.dimensions.concat(dataSet.metrics);

                angular.forEach(fields, function (field) {
                    selectedFields.push(field + '_' + (dataSet.dataSet.id || dataSet.dataSet))
                })
            });

            angular.forEach($scope.reportBuilder.joinBy, function (join) {
                angular.forEach(join.joinFields, function (field) {
                    if(selectedFields.indexOf(field.field + '_' + field.dataSet) == -1) {
                        field.field = null;
                    }
                });
            });
        }

        update();
        function update() {
            if (!$scope.isNew) {
                angular.forEach($scope.reportBuilder.reportViewDataSets, function (dataSet) {
                    angular.forEach(dataSet.filters, function (filter) {
                        filter.filterOld = true
                    });

                    // update filter
                    angular.forEach($scope.reportBuilder.filters, function (filter) {
                        if(filter.dataSet == dataSet.dataSet || filter.dataSet == dataSet.dataSet.id || filter.dataSet.id == dataSet.dataSet || (!!filter.dataSet.id && dataSet.dataSet.id && filter.dataSet.id == dataSet.dataSet.id)) {
                            dataSet.filters.push(filter);
                        }
                    });

                    var dataSetItem = _.find($scope.dataSets, function (item) {
                        return dataSet.dataSet == item.id || dataSet.dataSet.id == item.id
                    });

                    dataSet.tempDimensions = _.keys(dataSetItem.dimensions);
                    dataSet.tempMetrics = _.keys(dataSetItem.metrics);
                    dataSet.dimensionsMetrics = angular.extend(angular.copy(dataSetItem.dimensions), angular.copy(dataSetItem.metrics));

                    dataSet.fields = dataSet.dimensions.concat(dataSet.metrics);
                    dataSet.allFields = dataSet.tempDimensions.concat(dataSet.tempMetrics);
                });

                $scope.reportBuilder.filters = [];
            }
        }

        // replace expression for transform addCalculatedField
        setTimeout(function () {
            if (!$scope.isNew) {
                angular.forEach($scope.reportBuilder.transforms, function (transform) {
                    if('isPostGroup' in transform) {
                        transform.transformPosition = (('isPostGroup' in transform) && transform.isPostGroup) ? 'postGroupTransforms' : 'prePostTransforms';
                    }

                    if (transform.type == 'addCalculatedField' || transform.type == 'postAggregation') {
                        angular.forEach(transform.fields, function (field) {
                            angular.forEach($scope.totalDimensionsMetrics, function replace(dm) {
                                if (!field.expression || !angular.isString(field.expression)) {
                                    return;
                                }

                                var regExp = new RegExp(dm.key.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"), "g");
                                field.expression = field.expression.replace(regExp, dm.label);
                            });
                        })

                    }
                });
            }
        }, 0);
    }
})();