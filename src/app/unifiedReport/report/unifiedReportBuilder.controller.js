(function () {
    'use strict';

    angular.module('tagcade.unifiedReport.report')
        .controller('UnifiedReportBuilder', UnifiedReportBuilder);

    function UnifiedReportBuilder($scope, $timeout, $q, $translate, _, dataSets, reportViews, publishers, reportView, UnifiedReportViewManager, UserStateHelper, dateUtil, AlertService, historyStorage, HISTORY_TYPE_PATH) {
        $scope.reportViews = reportViews;
        $scope.dataSets = dataSets;
        $scope.publishers = publishers;
        $scope.listIntersectionDimensions = [];
        $scope.listDimensions = [];
        $scope.totalDimensionsMetrics = [];
        $scope.dimensionsMetrics = {};
        $scope.fieldInTransforms = {};
        $scope.selectedFields = [];
        $scope.summaryFieldTotal = [];
        $scope.fieldsHaveDateType = [];
        $scope.fieldsHaveNumberType = [];
        $scope.selectedAndAddedFieldsInTransform = [];

        $scope.isNew = reportView === null;
        $scope.reportBuilder = reportView || {
            publisher: null,
            dataSets: [
                {
                    filters: [],
                    dimensions: [],
                    metrics: [],
                    tempDimensions: [],
                    tempMetrics: [],
                    dimensionsMetrics: [],
                    fields: []
                }
            ],
            reportViews: [
                {
                    filters: [],
                    dimensions: [],
                    metrics: [],
                    tempDimensions: [],
                    tempMetrics: [],
                    dimensionsMetrics: [],
                    fields: []
                }
            ],
            joinBy: null,
            weightedCalculations: [],
            transforms: [],
            formats: [],
            showInTotal: [],
            multiView: false,
            subReportsIncluded: false
        };

        $scope.$watch(function () {
            return $scope.reportBuilder.dataSets;
        }, watchDataSet, true);

        $scope.$watch(function () {
            return $scope.reportBuilder.reportViews;
        }, watchReportView, true);

        $scope.$watch(function () {
            return $scope.reportBuilder;
        }, summaryFieldForTotal, true);

        $scope.$watch(function () {
            return $scope.summaryFieldTotal;
        }, updateSelectedSummaryFieldTotal, true);

        $scope.$watch(function () {
            return $scope.reportBuilder.transforms;
        }, updateSelectedAndAddedFieldsInTransform, true);

        $scope.$watch(function () {
            return $scope.reportBuilder.joinBy;
        }, watchDataSet, true);

        $scope.getReports = getReports;
        $scope.saveReport = saveReport;
        $scope.isFormValid = isFormValid;
        $scope.selectPublisher = selectPublisher;
        $scope.hasFieldForTotal = hasFieldForTotal;
        $scope.toggleFieldForTotal = toggleFieldForTotal;
        $scope.clickMultiView = clickMultiView;
        $scope.selectedJoinBy = selectedJoinBy;
        $scope.clickSubReportsIncluded = clickSubReportsIncluded;

        function clickSubReportsIncluded(subReportsIncluded) {
            angular.forEach($scope.reportBuilder.reportViews, function (reportView) {
                if (!subReportsIncluded) {
                    reportView.dimensions = [];
                }

                reportView.selectAllDimensionsMetrics = false;
                reportView.fields = [];
                var selectFields = reportView.dimensions.concat(reportView.metrics);

                angular.forEach(selectFields, function (selectField) {
                    var field = _.find(reportView.dimensionsMetrics, function (dm) {
                        return dm.key == selectField
                    });

                    if (!!field) {
                        reportView.fields.push(field)
                    }
                })
            });
        }

        function hasFieldForTotal(filed) {
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

        function toggleFieldForTotal(filed) {
            var index = $scope.reportBuilder.showInTotal.indexOf(filed.key);

            if (index == -1) {
                $scope.reportBuilder.showInTotal.push(filed.key);
            } else {
                $scope.reportBuilder.showInTotal.splice(index, 1);
            }
        }

        /**
         * reset form report builder when select publisher
         * @param publisher
         */
        function selectPublisher(publisher) {
            _resetForm();
        }

        function clickMultiView() {
            _resetForm();
        }

        function selectedJoinBy(filedName) {
            var countSelect = 0, countDimensions = 0;

            angular.forEach($scope.selectedFields, function (field) {
                if (field.root == filedName) {
                    countSelect++;
                    field.label = filedName;
                    field.key = filedName;

                    // Remove duplicate field in list after change
                    if (countSelect > 1) {
                        var tempIndex = $scope.selectedFields.indexOf(field);
                        if (tempIndex > -1) {
                            $scope.selectedFields.splice(tempIndex, 1);
                        }
                    }
                }
            });

            angular.forEach($scope.listDimensions, function (field) {
                if (field.root == filedName) {
                    countDimensions++;
                    field.label = filedName;
                    field.key = filedName;

                    // Remove duplicate field in list after change
                    if (countDimensions > 1) {
                        var tempIndex = $scope.listDimensions.indexOf(field);
                        if (tempIndex > -1) {
                            $scope.listDimensions.splice(tempIndex, 1);
                        }
                    }
                }
            });
        }

        function isFormValid() {
            if ($scope.reportBuilder.transforms.length > 0) {
                for (var index in $scope.reportBuilder.transforms) {
                    var transform = $scope.reportBuilder.transforms[index];

                    if (transform.type == 'sortBy') {
                        if (!angular.isArray(transform.fields) || !angular.isObject(transform.fields[0]) || !angular.isObject(transform.fields[1])) {
                            return false
                        }

                        if (transform.fields[0].names.length == 0 && transform.fields[1].names.length == 0) {
                            return false
                        }
                    }
                }
            }

            if (!$scope.reportBuilder.multiView) {
                if (!!$scope.reportBuilder.dataSets && $scope.reportBuilder.dataSets.length == 0) {
                    return false
                }

                for (var index in $scope.reportBuilder.dataSets) {
                    var dataSetItem = $scope.reportBuilder.dataSets[index];

                    if (!dataSetItem.dataSetId || (dataSetItem.dimensions.length == 0 && dataSetItem.metrics.length == 0)) {
                        return false
                    }
                }

                if (angular.isArray($scope.reportBuilder.dataSets) && $scope.reportBuilder.dataSets.length > 1) {
                    return !!$scope.reportBuilder.joinBy && $scope.unifiedBuilderForm.$valid;
                }
            } else {
                if (!!$scope.reportBuilder.reportViews && $scope.reportBuilder.reportViews.length == 0) {
                    return false
                }

                for (var index in $scope.reportBuilder.reportViews) {
                    var reportViewItem = $scope.reportBuilder.reportViews[index];

                    if (!reportViewItem.reportViewId || (reportViewItem.dimensions.length == 0 && reportViewItem.metrics.length == 0)) {
                        return false
                    }
                }
            }

            return $scope.unifiedBuilderForm.$valid;
        }

        function saveReport() {
            var reportBuilder = _refactorJson($scope.reportBuilder);
            delete reportBuilder.publisher;

            var reportViewSave = UnifiedReportViewManager.one(reportBuilder.id).patch(reportBuilder);
            reportViewSave
                .then(function () {
                    AlertService.addFlash({
                        type: 'success',
                        message: 'The report view has been updated'
                    })
                })
                .then(
                function () {
                    return historyStorage.getLocationPath(HISTORY_TYPE_PATH.unifiedReportView, '^.listReportView');
                }
            );
        }

        function getReports(save) {
            var reportBuilder = _refactorJson($scope.reportBuilder);

            var params = {
                dataSets: angular.toJson(reportBuilder.dataSets),
                reportViews: angular.toJson(reportBuilder.reportViews),
                filter: angular.toJson(reportBuilder.filter),
                transforms: angular.toJson(reportBuilder.transforms),
                showInTotal: angular.toJson(reportBuilder.showInTotal),
                weightedCalculations: angular.toJson(reportBuilder.weightedCalculations),
                formats: angular.toJson(reportBuilder.formats),
                joinBy: reportBuilder.joinBy,
                name: reportBuilder.name,
                alias: reportBuilder.alias,
                reportView: reportBuilder.id,
                fieldTypes: angular.toJson(reportBuilder.fieldTypes),
                multiView: reportBuilder.multiView,
                subReportsIncluded: reportBuilder.subReportsIncluded,
               // showDataSetName: reportBuilder.showDataSetName
            };

            if ($scope.isAdmin()) {
                params.publisher = reportBuilder.publisher.id || reportBuilder.publisher
            } else {
                delete reportBuilder.publisher
            }

            if (save) {
                var reportViewSave = (!$scope.isNew && reportBuilder.id) ? UnifiedReportViewManager.one(reportBuilder.id).patch(reportBuilder) : UnifiedReportViewManager.post(reportBuilder);

                reportViewSave.then(function (data) {
                    if ($scope.isNew || !params.reportView) {
                        params.reportView = data.id;
                    }

                    _viewDetail(params);

                    AlertService.addFlash({
                        type: 'success',
                        message: $scope.isNew ? 'The report view has been created' : 'The report view has been updated'
                    });
                });

                params.saveReportView = true;
            } else {
                _viewDetail(params);
            }
        }

        function _viewDetail(params) {
            var transition = UserStateHelper.transitionRelativeToBaseState(
                'unifiedReport.report.detail',
                params
            );

            $q.when(transition)
                .catch(function (error) {
                    console.log(params);

                    AlertService.replaceAlerts({
                        type: 'error',
                        message: $translate.instant('REPORT.REPORT_FAIL')
                    });
                });
        }

        function watchDataSet() {
            if ($scope.reportBuilder.multiView) {
                return;
            }

            $scope.totalDimensionsMetrics = [];
            $scope.listIntersectionDimensions = [];
            $scope.listDimensions = [];
            $scope.dimensionsMetrics = {};
            $scope.selectedFields = [];
            $scope.fieldsHaveDateType = [];
            $scope.fieldsHaveNumberType = [];

            var totalDimensions = [];

            angular.forEach($scope.reportBuilder.dataSets, function (item) {
                _setTotalDimensionsSelected(item);

                var dataSet = _.find($scope.dataSets, function (dataSet) {
                    return dataSet.id == item.dataSetId;
                });

                if (!!dataSet) {
                    _setSelectedField(item, dataSet);

                    // save all dimensions of data set selected
                    totalDimensions.push(item.dimensions);
                    _setDimensionsMetrics(dataSet);
                    _setTotalDimensionsMetrics(dataSet);
                    _fieldsHaveDateType();
                    _fieldsHaveNumberType();

                    $timeout(function () {
                        item.selectAllDimensionsMetrics = (item.dimensions.length == _.values(dataSet.dimensions).length && item.metrics.length == _.values(dataSet.metrics).length);
                    }, 0, true)
                }

                // _removeFileInFilterNotSelected(item);
            });

            // find value dimension == when have been selected
            $scope.listIntersectionDimensions = $scope.reportBuilder.dataSets.length > 1 ? _.intersection.apply(_, totalDimensions) : [];

            // remove join by
            if ($scope.listIntersectionDimensions.indexOf($scope.reportBuilder.joinBy) == -1) {
                $scope.reportBuilder.joinBy = null;
            }

            updateSelectedAndAddedFieldsInTransform();
            _removeFieldNotSelectInTransform();

            _removeFieldNotSelectInFormat();
        }

        function watchReportView() {
            if (!$scope.reportBuilder.multiView) {
                return;
            }

            $scope.selectedFields = [];
            $scope.totalDimensionsMetrics = [];
            $scope.listDimensions = [];
            $scope.dimensionsMetrics = {};
            $scope.listIntersectionDimensions = [];
            $scope.fieldsHaveDateType = [];
            $scope.fieldsHaveNumberType = [];

            angular.forEach($scope.reportBuilder.reportViews, function (item) {
                $scope.selectedFields = $scope.selectedFields.concat(item.fields);
                $scope.totalDimensionsMetrics = $scope.totalDimensionsMetrics.concat(item.tempDimensions.concat(item.tempMetrics));

                angular.forEach(item.dimensions, function (dimension) {
                    var findDimension = _.find(item.tempDimensions, function (tempD) {
                        return tempD.key == dimension;
                    });

                    if (!!findDimension) {
                        var index = _.findIndex($scope.listDimensions, function (dm) {
                            return dm.key == findDimension.key
                        });

                        if (index == -1) {
                            $scope.listDimensions.push(findDimension)
                        }
                    }
                });

                var reportView = _.find($scope.reportViews, function (reportView) {
                    return reportView.id == item.reportViewId;
                });

                if (!!reportView) {
                    $timeout(function () {
                        item.selectAllDimensionsMetrics = ((item.dimensions.length == reportView.dimensions.length || !$scope.reportBuilder.subReportsIncluded) && item.metrics.length == reportView.metrics.length);
                    }, 0, true);
                }

                // _removeFileInFilterNotSelected(item);
            });

            _fieldsHaveDateType();
            _fieldsHaveNumberType();

            angular.forEach($scope.totalDimensionsMetrics, function (dm) {
                $scope.dimensionsMetrics[dm.key] = dm.type;
            });

            // update
            updateSelectedAndAddedFieldsInTransform();

            _removeFieldNotSelectInTransform();
            _removeFieldNotSelectInFormat();
        }

        function summaryFieldForTotal() {
            $scope.summaryFieldTotal = [];

            if (!$scope.reportBuilder.multiView) {
                angular.forEach($scope.reportBuilder.dataSets, function (item) {
                    var dataSet = _.find($scope.dataSets, function (dataSet) {
                        return dataSet.id == item.dataSetId;
                    });

                    angular.forEach(item.dimensions, function (dimension) {
                        if (dataSet.dimensions[dimension] == 'number' || dataSet.dimensions[dimension] == 'decimal') {
                            $scope.summaryFieldTotal.push({
                                label: dimension + ' (' + dataSet.name + ')',
                                key: dimension + '_' + dataSet.id,
                                root: dimension,
                                type: dataSet.dimensions[dimension]
                            });
                        }
                    });

                    angular.forEach(item.metrics, function (metric) {
                        if (dataSet.metrics[metric] == 'number' || dataSet.metrics[metric] == 'decimal') {
                            $scope.summaryFieldTotal.push({
                                label: metric + ' (' + dataSet.name + ')',
                                key: metric + '_' + dataSet.id,
                                root: metric,
                                type: dataSet.metrics[metric]
                            });
                        }
                    })
                });
            } else {
                angular.forEach($scope.reportBuilder.reportViews, function (item) {
                    angular.forEach(item.dimensions, function (dimension) {
                        if ($scope.dimensionsMetrics[dimension] == 'number' || $scope.dimensionsMetrics[dimension] == 'decimal') {
                            var field = _.find($scope.totalDimensionsMetrics, function (dm) {
                                return dm.key == dimension;
                            });

                            if (!!field) {
                                $scope.summaryFieldTotal.push(field);
                            }
                        }
                    });

                    angular.forEach(item.metrics, function (metric) {
                        if ($scope.dimensionsMetrics[metric] == 'number' || $scope.dimensionsMetrics[metric] == 'decimal') {
                            var field = _.find($scope.totalDimensionsMetrics, function (dm) {
                                return dm.key == metric;
                            });

                            if (!!field) {
                                $scope.summaryFieldTotal.push(field);
                            }
                        }
                    })
                });
            }

            angular.forEach($scope.reportBuilder.transforms, function (transform) {
                if (transform.type == 'addField' || transform.type == 'addCalculatedField' || transform.type == 'comparisonPercent') {
                    angular.forEach(transform.fields, function (field) {
                        if (!!field.field) {
                            $scope.fieldInTransforms[field.field] = field.type;

                            if (field.type == 'number' || field.type == 'decimal') {
                                $scope.summaryFieldTotal.push({
                                    label: field.field,
                                    key: field.field,
                                    root: field.field,
                                    type: field.type
                                });
                            }
                        }
                    })
                }
            });

            $scope.summaryFieldTotal = _.uniq(_.union($scope.summaryFieldTotal), false, _.property('key'));

            //reset field
            $scope.fieldsHaveDateType = [];
            $scope.fieldsHaveNumberType = [];

            _fieldsHaveDateType();
            _fieldsHaveNumberType();
            _removeFieldNotSelectInFormat();
        }

        function _fieldsHaveDateType() {
            var fields = _getAllFieldInTransForm().concat($scope.selectedFields);
            angular.forEach(fields, function (metric) {
                if (metric.type == 'date' || metric.type == 'dateTime') {
                    var index = _.findIndex($scope.fieldsHaveDateType, function (field) {
                        return field.key == metric.key
                    });

                    if (index == -1) {
                        $scope.fieldsHaveDateType.push(metric);
                    }
                }
            });
        }

        function _fieldsHaveNumberType() {
            var fields = _getAllFieldInTransForm().concat($scope.selectedFields);

            angular.forEach(fields, function (metric) {
                if (metric.type == 'number' || metric.type == 'decimal') {
                    var index = _.findIndex($scope.fieldsHaveNumberType, function (field) {
                        return field.key == metric.key
                    });

                    if (index == -1) {
                        $scope.fieldsHaveNumberType.push(metric)
                    }
                }
            });
        }

        function _getAllFieldInTransForm() {
            var fieldsTransForm = [];
            angular.forEach($scope.reportBuilder.transforms, function (transform) {
                if (transform.type == 'addField' || transform.type == 'addCalculatedField' || transform.type == 'comparisonPercent') {
                    angular.forEach(transform.fields, function (field) {
                        if (!!field.field) {
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
            });

            return fieldsTransForm;
        }

        function _refactorJson(reportBuilder) {
            reportBuilder = angular.copy(reportBuilder);
            reportBuilder.fieldTypes = angular.extend(angular.copy($scope.dimensionsMetrics), $scope.fieldInTransforms);

            var builders = reportBuilder.multiView ? reportBuilder.reportViews : reportBuilder.dataSets;

            angular.forEach(builders, function (item) {
                angular.forEach(item.filters, function (filter) {
                    if (filter.type == 'date') {
                        if (filter.dateType == 'customRange') {
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

                delete item.tempDimensions;
                delete item.tempMetrics;
                delete item.fields;
                delete item.allFields;
                delete item.dimensionsMetrics;
                delete item.selectAllDimensionsMetrics;
            });

            angular.forEach(reportBuilder.transforms, function (transform) {
                if (transform.type == 'date' || transform.type == 'number') {
                    delete transform.fields;
                } else {
                    delete transform.field;
                }

                if (transform.type == 'addField') {
                    angular.forEach(transform.fields, function (field) {
                        if (field.type == 'decimal' || field.type == 'number') {
                            field.value = Number(field.value);
                        }
                    })

                }

                if (transform.type == 'addCalculatedField') {
                    angular.forEach(transform.fields, function (field) {
                        angular.forEach($scope.selectedFields, function replace(dm) {
                            if (!field.expression || !angular.isString(field.expression)) {
                                return;
                            }

                            if(dm.label == dm.key) {
                                return
                            }

                            var regExp = new RegExp(dm.label.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"), "g");
                            field.expression = field.expression.replace(regExp, dm.key);
                        });
                    })

                }
            });

            if (reportBuilder.multiView) {
                delete reportBuilder.dataSets
            } else {
                delete reportBuilder.reportViews
            }

            return reportBuilder;
        }

        function _resetForm() {
            $scope.reportBuilder.dataSets = [
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
            $scope.reportBuilder.reportViews = [
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

            $scope.reportBuilder.joinBy = null;
            $scope.reportBuilder.formats = [];
            $scope.reportBuilder.transforms = [];
            $scope.reportBuilder.weightedCalculations = [];
            $scope.reportBuilder.showInTotal = [];
            $scope.reportBuilder.subReportsIncluded = false;
          //  $scope.reportBuilder.showDataSetName = false;
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
                var dataSet = _.find(dataSets, function (dataSet) {
                    return dataSet.id == item.dataSetId
                });

                $scope.selectedFields.push({
                    label: field + ' (' + dataSet.name + ')',
                    key: field + '_' + item.dataSetId,
                    root: field,
                    type: allFields[field]
                })
            });

            // Need to filter to sure UI display correct value
            selectedJoinBy($scope.reportBuilder.joinBy);
        }

        /**
         * $scope.totalDimensionsMetrics = [{label: 'field (Data Set ID 1)', key: 'field_dataSetId', root: ''field}]
         * @param dataSet
         * @private
         */
        function _setTotalDimensionsMetrics(dataSet) {
            var allFields = angular.extend(angular.copy(dataSet.dimensions), angular.copy(dataSet.metrics));

            angular.forEach(allFields, function (field) {
                $scope.totalDimensionsMetrics.push({
                    label: field + ' (' + dataSet.name + ')',
                    key: field + '_' + dataSet.id,
                    root: field
                })
            });
        }

        /**
         * $scope.listDimensions = [{label: 'field (Data Set ID 1)', key: 'field_dataSetId', root: ''field}]
         * @param item
         * @private
         */
        function _setTotalDimensionsSelected(item) {
            angular.forEach(item.dimensions, function (field) {
                var dataSet = _.find(dataSets, function (dataSet) {
                    return dataSet.id == item.dataSetId
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

        function _removeFileInFilterNotSelected(data) {
            var filters = angular.copy(data.filters);

            angular.forEach(filters, function (filter) {
                var hasIndex = _.findIndex($scope.selectedFields, function (fieldSelect) {
                    if ($scope.reportBuilder.multiView) {
                        return fieldSelect.key == filter.field;
                    }
                    // Note: Join field in SelectedField has not _ character.
                    if (filter.field == $scope.reportBuilder.joinBy) {
                        return fieldSelect.key == filter.field
                    }
                    return fieldSelect.key == filter.field + '_' + data.dataSetId;
                });

                if (hasIndex == -1 && !!filter.field) {
                    var index = _.findIndex(data.filters, function (item) {
                        return item.field == filter.field;
                    });

                    if (index > -1) {
                        data.filters.splice(index, 1)
                    }
                }
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

                if (transform.type == 'comparisonPercent') {
                    angular.forEach(transform.fields, function (field) {
                        if (_.values(selectedFields).indexOf(field.denominator) == -1) {
                            field.denominator = null
                        }

                        if (_.values(selectedFields).indexOf(field.numerator) == -1) {
                            field.numerator = null
                        }
                    });
                }
            });
        }

        function _setTempDimensions(item, reportView) {
            reportView.tempDimensions = [];
            angular.forEach(item.dimensions, function (dimension) {
                var key = null;
                var id = null;

                if(dimension.lastIndexOf('_') > -1) {
                    key = dimension.slice(0, dimension.lastIndexOf('_'));
                    id = dimension.slice(dimension.lastIndexOf('_') + 1, dimension.length);
                } else {
                    key = dimension;
                }

                var dataSet = _.find($scope.dataSets, function (dataSet) {
                    return !!dataSet.dimensions[key] && dataSet.id == id;
                });

                if (!!dataSet) {
                    reportView.tempDimensions.push({
                        key: dimension,
                        label: key + ' (' + dataSet.name + ')',
                        type: dataSet.dimensions[key],
                        dataSetName: !!dataSet ? dataSet.name : null,
                        hasDataSetName: true
                    })
                } else {
                    reportView.tempDimensions.push({
                        key: dimension,
                        label: dimension,
                        type: item.fieldTypes[dimension],
                        dataSetName: !!dataSet ? dataSet.name : null,
                        hasDataSetName: false
                    })
                }
            });
        }

        function _setTempMetrics(item, reportView) {
            reportView.tempMetrics = [];
            angular.forEach(item.metrics, function (metric) {
                var key = null;
                var id = null;

                if(metric.lastIndexOf('_') > -1) {
                    key = metric.slice(0, metric.lastIndexOf('_'));
                    id = metric.slice(metric.lastIndexOf('_') + 1, metric.length);
                } else {
                    key = metric;
                }

                var dataSet = _.find($scope.dataSets, function (dataSet) {
                    return !!dataSet.metrics[key] && dataSet.id == id;
                });

                if (!!dataSet) {
                    reportView.tempMetrics.push({
                        key: metric,
                        label: key + ' (' + dataSet.name + ')',
                        type: dataSet.metrics[key],
                        dataSetName: !!dataSet ? dataSet.name : null,
                        hasDataSetName: true
                    })
                } else {
                    reportView.tempMetrics.push({
                        key: metric,
                        label: metric,
                        type: item.fieldTypes[metric],
                        dataSetName: !!dataSet ? dataSet.name : null,
                        hasDataSetName: false
                    })
                }
            });
        }

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
                        if (field == 'report_view_alias' && $scope.reportBuilder.multiView) {
                            return
                        }

                        if (format.fields.indexOf(field) > -1) {
                            format.fields.splice(format.fields.indexOf(field), 1)
                        }
                    });
                }
            });
        }

        update();
        function update() {
            if (!$scope.isNew) {
                if (!$scope.reportBuilder.multiView) {
                    angular.forEach($scope.reportBuilder.dataSets, function (dataSet) {
                        var dataSetItem = _.find($scope.dataSets, function (item) {
                            return dataSet.dataSetId == item.id
                        });

                        dataSet.tempDimensions = _.keys(dataSetItem.dimensions);
                        dataSet.tempMetrics = _.keys(dataSetItem.metrics);
                        dataSet.dimensionsMetrics = angular.extend(angular.copy(dataSetItem.dimensions), angular.copy(dataSetItem.metrics));

                        dataSet.fields = dataSet.dimensions.concat(dataSet.metrics);
                        dataSet.allFields = dataSet.tempDimensions.concat(dataSet.tempMetrics);
                    });
                } else {
                    angular.forEach($scope.reportBuilder.reportViews, function (reportView) {
                        var reportViewItem = _.find($scope.reportViews, function (item) {
                            return reportView.reportViewId == item.id
                        });

                        _setTempDimensions(reportViewItem, reportView);
                        _setTempMetrics(reportViewItem, reportView);
                        reportView.dimensionsMetrics = reportView.tempDimensions.concat(angular.copy(reportView.tempMetrics));

                        reportView.fields = [];

                        var fields = reportView.dimensions.concat(reportView.metrics);
                        angular.forEach(fields, function (field) {
                            var findField = _.find(reportView.dimensionsMetrics, function (dm) {
                                return dm.key == field;
                            });

                            if (!!findField) {
                                reportView.fields.push(findField)
                            }
                        });
                    });
                }
            }
        }

        // replace expression for transform addCalculatedField
        setTimeout(function () {
            if (!$scope.isNew) {
                angular.forEach($scope.reportBuilder.transforms, function (transform) {
                    if (transform.type == 'addCalculatedField') {
                        angular.forEach(transform.fields, function (field) {
                            angular.forEach($scope.selectedFields, function replace(dm) {
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