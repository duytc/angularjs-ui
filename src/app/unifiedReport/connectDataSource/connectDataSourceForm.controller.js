(function() {
    'use strict';

    angular.module('tagcade.unifiedReport.connect')
        .controller('ConnectDataSourceForm', ConnectDataSourceForm);

    function ConnectDataSourceForm($scope, $q, $modal, _, dataSets, dataSources, connectedDataSourceService, connectDataSource, AlertService, sessionStorage, FileUploader, UnifiedReportConnectDataSourceManager, UnifiedReportDataSourceManager, ServerErrorProcessor, dataSet, dateUtil, historyStorage, HISTORY_TYPE_PATH, REPORT_VIEW_INTERNAL_FIELD_VARIABLE, DateFormatter) {
        $scope.fieldNameTranslations = {
            dataSet: 'Data Set',
            dataSource: 'Data Source',
            mapFields: 'Map Fields',
            requires: 'Requires',
            filters: 'Filters',
            transforms: 'Transforms'
        };

        $scope.isNew = connectDataSource === null;
        $scope.formProcessing = false;
        $scope.dataSourceFields = [];
        var listDetectFields = [];

        $scope.alertSettings = [
            {label: 'Alert me when new data is added from this connected data source', key: 'dataAdded'},
            {label: 'Alert me if data import fails', key: 'importFailure'}
        ];

        $scope.dataSources = dataSources;
        $scope.dataSets = dataSets;
        $scope.dataSet = dataSet;

        $scope.totalDimensionsMetrics = _.keys(angular.extend($scope.dataSet.dimensions, $scope.dataSet.metrics));
        $scope.dimensionsMetrics = angular.extend($scope.dataSet.dimensions, $scope.dataSet.metrics);

        $scope.connectDataSource = connectDataSource || {
            dataSet: dataSet,
            dataSource: null,
            mapFields: {},
            temporaryFields: [],
            requires: [],
            filters: [],
            transforms: [],
            alertSetting: [],
            replayData: false,
            userReorderTransformsAllowed: false
        };
        $scope.totalFields = {
            fieldsForRequires: []
        };

        $scope.selected = {};

        var baseUploadURL = UnifiedReportDataSourceManager.one().getRestangularUrl() + '/%dataSourceId%/uploadfordetectedfields';
        var uploader = $scope.uploader = new FileUploader({
            url: !$scope.isNew ? baseUploadURL.replace('%dataSourceId%', connectDataSource.dataSource.id || connectDataSource.dataSource) : baseUploadURL,
            autoUpload: true,
            headers: {
                Authorization: 'Bearer ' + sessionStorage.getCurrentToken()
            }
        });

        uploader.filters.push({
            name: 'customFilter',
            fn: function(item /*{File|FileLikeObject}*/ , options) {
                var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                var extension = '|' + item.name.slice(item.name.lastIndexOf('.') + 1) + '|';

                return '|vnd.ms-excel|vnd.openxmlformats-officedocument.spreadsheetml.sheet|json|csv|'.indexOf(type) !== -1 || '|xls|xlsx|json|csv|'.indexOf(extension) !== -1;
            }
        });

        uploader.onErrorItem = function(fileItem, response, status, headers) {
            if (status == 413) {
                AlertService.replaceAlerts({
                    type: 'error',
                    message: "'" + fileItem.file.name + "' isn't uploaded because of too large size"
                });
            } else {
                AlertService.replaceAlerts({
                    type: 'error',
                    message: response.message || "Upload file '" + fileItem.file.name + "' fail due to can't find header!"
                });
            }
        };

        uploader.onSuccessItem = function(fileItem, response, status, headers) {
            if(!!$scope.connectDataSource.dataSource) {
                // reset when upload file success
                // $scope.connectDataSource.mapFields = {};

                var detectedFields = response.fields;
                listDetectFields.push(response);

                if(!detectedFields || detectedFields.length == 0) {
                    AlertService.replaceAlerts({
                        type: 'warning',
                        message: "Could not detect fields from uploaded file!"
                    });

                    return;
                } else {
                    AlertService.replaceAlerts({
                        type: 'success',
                        message: "Detect fields from uploaded file success!"
                    });
                }

                var index = _.findIndex($scope.dataSources, function (item) {
                    return item.id == $scope.connectDataSource.dataSource.id || item.id == $scope.connectDataSource.dataSource;
                });

                if(index > -1) {
                    delete  dataSources[index].detectedFields;
                    delete  $scope.dataSources[index].detectedFields;

                    $scope.dataSources[index].detectedFields = dataSources[index].detectedFields = detectedFields;

                    $scope.dataSourceFields = Object.keys(detectedFields);
                    
                    angular.forEach(angular.copy($scope.connectDataSource.mapFields), function (value, key) {
                        if($scope.dataSourceFields.indexOf(key) == -1) {
                            delete $scope.connectDataSource.mapFields[key]
                        }
                    })
                }
            }

            angular.forEach($scope.connectDataSource.transforms, function (transform) {
                if(transform.type == 'addCalculatedField' || transform.type == 'addConcatenatedField') {
                    angular.forEach(transform.fields, function (field) {
                        field.expression = null
                    });
                }
            })
        };

        updateConnectedDataSourceForm();

        $scope.$watch(function () {
            return $scope.connectDataSource.mapFields
        }, function () {
            _getFieldsForRequires();

            _removeFieldInRequires();
        }, true);

        $scope.$watch(function () {
            return $scope.connectDataSource.transforms
        }, function () {
            _listenTransform();
        }, true);

        $scope.isFormValid = isFormValid;
        $scope.submit = submit;
        $scope.toggleField = toggleField;
        $scope.hasField = hasField;
        $scope.labelField = labelField;
        $scope.isEmpty = isEmpty;
        $scope.backToConnectDataSourceList = backToConnectDataSourceList;
        $scope.hasAlertSetting = hasAlertSetting;
        $scope.toggleAlertSetting = toggleAlertSetting;
        $scope.selectDataSource = selectDataSource;
        $scope.selectMapField = selectMapField;
        $scope.previewData = previewData;
        $scope.addValueTemporaryFields = addValueTemporaryFields;

        function addValueTemporaryFields($query) {
            if(!/^[a-zA-Z_][a-zA-Z0-9_$\s]*$/.test($query)) {
                return;
            }

            return $query;
        }

        function previewData() {
            $modal.open({
                templateUrl: 'unifiedReport/connectDataSource/previewData.tpl.html',
                size: 'lg',
                controller: 'PreviewDataConnect',
                resolve: {
                    connectDataSource: function () {
                        var connectDataSource = _refactorJson($scope.connectDataSource);
                        connectDataSource.isDryRun = true;
                        connectDataSource.connectedDataSourceId = $scope.connectDataSource.id;

                        return  connectDataSource;
                    },
                    dataSourceEntries: function (UnifiedReportDataSourceManager) {
                        return UnifiedReportDataSourceManager.one($scope.connectDataSource.dataSource.id || $scope.connectDataSource.dataSource).one('datasourceentries').getList(null, {orderBy: 'desc', sortField: 'receivedDate'});
                    },
                    listFilePaths: function () {
                        return listDetectFields
                    }
                }
            });
        }

        function selectMapField(field) {
            if($scope.dimensionsMetrics[field] == 'date' || $scope.dimensionsMetrics[field] == 'datetime') {
                var index = _.findIndex($scope.connectDataSource.transforms, function (transform) {
                    return transform.field == field;
                });

                if(index == -1) {
                    $scope.connectDataSource.transforms.push({
                        field: field,
                        type: 'date',
                        to: $scope.dimensionsMetrics[field] == 'date' ? 'YYYY-MM-DD': 'YYYY-MM-DD HH:mm:ss',
                        openStatus: true,
                        from: [{isCustomFormatDateFrom: false, format: null}],
                        timezone: $scope.dimensionsMetrics[field] == 'datetime' ? 'UTC': null
                    })

                }
            }
        }
        
        function hasAlertSetting(alertSetting) {
            return $scope.connectDataSource.alertSetting.indexOf(alertSetting.key) > -1;
        }
        
        function toggleAlertSetting(alertSetting) {
            var idx = $scope.connectDataSource.alertSetting.indexOf(alertSetting.key);

            if (idx > -1) {
                $scope.connectDataSource.alertSetting.splice(idx, 1);
            } else {
                $scope.connectDataSource.alertSetting.push(alertSetting.key);
            }
        }

        function backToConnectDataSourceList() {
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.connectDataSource, '^.list');
        }

        function selectDataSource(dataSource) {
            uploader.url = baseUploadURL.replace('%dataSourceId%', dataSource.id).replace('%autoImport%', $scope.selected.autoImport);
            $scope.dataSourceFields = Object.keys(dataSource.detectedFields);

            angular.forEach(angular.copy($scope.connectDataSource.mapFields), function (value, key) {
                if($scope.dataSourceFields.indexOf(key) == -1) {
                    delete $scope.connectDataSource.mapFields[key]
                }
            });
        }

        function isEmpty(object) {
            return _.isEmpty(object)
        }

        function hasField(filed) {
            if(!$scope.connectDataSource.mapFields) {
                return false;
            }

            return !!$scope.connectDataSource.mapFields[filed];
        }

        function toggleField(filed) {
            var hasKey = Object.keys($scope.connectDataSource.mapFields).indexOf(filed) > -1;

            if (hasKey) {
                delete $scope.connectDataSource.mapFields[filed];
            } else {
                $scope.connectDataSource.mapFields[filed] = null;
            }
        }

        function labelField(field) {
            return _.find($scope.dataSourceFields, function (dataSourceField) {
                return dataSourceField.key == field;
            }).label
        }

        function isFormValid() {
            return $scope.connectForm.$valid &&
                !isEmpty($scope.connectDataSource.mapFields) && (
                    ($scope.connectDataSource.transforms.length > 0 && validConnectDataSource())
                    || $scope.connectDataSource.transforms.length == 0 )
                ;
        }

        function validConnectDataSource() {
            var x;
            for (x in $scope.connectDataSource.transforms) {
                var transform = $scope.connectDataSource.transforms[x];

                if((transform.type != 'number' && transform.type != 'date' && transform.type != 'augmentation' && transform.type != 'subsetGroup')) {
                    if (_.isUndefined(transform.fields) || transform.fields.length == 0) {
                        return false;
                    }
                }

                if (transform.type == 'subsetGroup') {
                    if(!transform.mapFields || transform.mapFields.length == 0 || transform.groupFields.length == 0) {
                        return false
                    }
                }

                if (transform.type == 'sortBy') {
                    if(!angular.isArray(transform.fields) || !angular.isObject(transform.fields[0]) || !angular.isObject(transform.fields[1])) {
                        return false
                    }

                    if(transform.fields[0].names.length == 0 && transform.fields[1].names.length == 0) {
                        return false
                    }
                }
            }

            return true;
        }

        function submit() {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            $scope.formProcessing = true;

            var dfd = $q.defer();

            dfd.promise.then(function () {
                var connectDataSource = _refactorJson($scope.connectDataSource);

                var saveChannel = $scope.isNew ? UnifiedReportConnectDataSourceManager.post(connectDataSource) : UnifiedReportConnectDataSourceManager.one(connectDataSource.id).patch(connectDataSource);

                saveChannel
                    .catch(
                        function (response) {
                            if(!response.data.errors) {
                                AlertService.replaceAlerts({
                                    type: 'error',
                                    message: response.data.message
                                });
                            }

                            var errorCheck = ServerErrorProcessor.setFormValidationErrors(response, $scope.connectForm, $scope.fieldNameTranslations);
                            $scope.formProcessing = false;

                            return errorCheck;
                        })
                    .then(
                        function () {
                            AlertService.addFlash({
                                type: 'success',
                                message: 'The connect data source has been created'
                            });
                        })
                    .then(
                        function () {
                            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.connectDataSource, '^.list', {dataSetId: $scope.dataSet.id || $scope.dataSet});
                        }
                    )
            });

            if ($scope.isNew) {
                var modalInstance = $modal.open({
                    templateUrl: 'unifiedReport/connectDataSource/confirmReplayData.tpl.html',
                    controller: function ($scope, connectDataSource) {
                        $scope.connectDataSource = connectDataSource;
                    },
                    resolve: {
                        connectDataSource: function () {
                            return $scope.connectDataSource;
                        }
                    }
                });

                modalInstance.result.then(function () {
                    dfd.resolve();
                }).catch(function () {
                    $scope.formProcessing = false;
                });

            } else {
                // if it is not a pause, proceed without a modal
                dfd.resolve();
            }
        }

        function updateConnectedDataSourceForm() {
            if(!$scope.isNew) {
                if(!$scope.connectDataSource.mapFields || angular.isArray($scope.connectDataSource.mapFields)) {
                    $scope.connectDataSource.mapFields = {}
                }

                angular.forEach(connectDataSource.filters, function (filter) {
                    if(filter.type == 'date') {
                        filter.date = {
                            startDate: filter.startDate,
                            endDate: filter.endDate
                        }
                    }
                });

                $scope.dataSourceFields = Object.keys(connectDataSource.dataSource.detectedFields);

                var temporaryFields = [];
                angular.forEach(connectDataSource.temporaryFields, function (field) {
                    temporaryFields.push(field.slice('__$$TEMP$$'.length, field.length));
                });

                connectDataSource.temporaryFields = temporaryFields;

                var allFields = _getAllFieldInTransform($scope.connectDataSource.transforms).concat(connectedDataSourceService.inputFormatDataSourceField($scope.dataSourceFields)).concat(connectedDataSourceService.inputFormatTemporaryFields(connectDataSource.temporaryFields));

                angular.forEach($scope.connectDataSource.transforms, function (transform) {
                    if(transform.type == 'addField') {
                        angular.forEach(transform.fields, function (field) {
                            if($scope.dimensionsMetrics[field.field] == 'datetime' || $scope.dimensionsMetrics[field.field] == 'date') {
                                if(field.value != '[__date]') {
                                    field.value = {endDate: field.value}
                                }
                            }
                        });
                    }

                    if(transform.type == 'augmentation') {
                        var dataSetAugmentation = _.find($scope.dataSets, function (dataSet) {
                            return dataSet.id == transform.mapDataSet
                        });

                        if (!!dataSetAugmentation) {
                            transform.allFieldsDataSet = _.keys(dataSetAugmentation.dimensions).concat(_.keys(dataSetAugmentation.metrics));
                        }

                        if (transform.type == 'augmentation') {
                            angular.forEach(transform.customCondition, function (custom) {
                                var dataSet = _.find($scope.dataSets, function (dataSetItem) {
                                    return dataSetItem.id == transform.mapDataSet
                                });

                                if(dataSet.metrics[custom.field] == 'date' ||  dataSet.metrics[custom.field] == 'datetime' || dataSet.dimensions[custom.field] == 'date' ||  dataSet.dimensions[custom.field] == 'datetime') {
                                    custom.value = {
                                        endDate: custom.value
                                    };
                                }
                            })
                        }
                    }

                    if (transform.type == 'addCalculatedField') {
                        angular.forEach(transform.fields, function (field) {
                            angular.forEach(allFields, function (item) {
                                item.key = angular.copy(item.key);
                                var regExp = new RegExp(item.key.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"), "g");
                                field.expression = field.expression.replace(regExp, item.label);
                            });
                        })
                    }

                    if (transform.type == 'addField') {
                        angular.forEach(transform.fields, function (field) {
                            if ($scope.dimensionsMetrics[field.field] == 'text' || $scope.dimensionsMetrics[field.field] == 'largeText') {
                                angular.forEach(allFields, function (item) {
                                    item.key = angular.copy(item.key);
                                    var regExp = new RegExp(item.key.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"), "g");
                                    field.value = field.value.replace(regExp, item.label);
                                });
                            }
                        })

                    }
                });

                var mapFields = {};

                angular.forEach(connectDataSource.mapFields, function (mapField, key) {
                    mapFields[key.slice('__$$FILE$$'.length, key.length)] = mapField
                });

                connectDataSource.mapFields = mapFields;
            }
        }

        function _refactorJson(connectDataSource) {
            connectDataSource = angular.copy(connectDataSource);
            var mapFieldsClone = angular.copy(connectDataSource.mapFields);
            connectDataSource.mapFields = {};

            angular.forEach(connectDataSource.filters, function (filter) {
                if(filter.type == 'date') {
                    filter.startDate = dateUtil.getFormattedDate(filter.date.startDate);
                    filter.endDate = dateUtil.getFormattedDate(filter.date.endDate);

                    delete filter.date;
                    delete filter.comparison;
                    delete filter.compareValue;
                }
                if(filter.type == 'number') {
                    delete filter.date;
                    delete filter.startDate;
                    delete filter.endDate;
                    delete filter.format;
                }

                if(filter.type == 'text') {
                    delete filter.date;
                    delete filter.startDate;
                    delete filter.endDate;
                    delete filter.format;
                }
            });

            angular.forEach(mapFieldsClone, function (value, key) {
                connectDataSource.mapFields['__$$FILE$$' + key] = value;
            });

            var allFields = _getAllFieldInTransform($scope.connectDataSource.transforms).concat(connectedDataSourceService.inputFormatDataSourceField($scope.dataSourceFields)).concat(connectedDataSourceService.inputFormatTemporaryFields($scope.connectDataSource.temporaryFields));

            angular.forEach(connectDataSource.transforms, function (transform) {
                if(transform.type == 'number' || transform.type == 'date') {
                    delete transform.fields;

                    if(transform.type == 'number') {
                        delete transform.to;
                        delete transform.from;
                    }

                    if(transform.type == 'date') {
                        delete transform.decimals;
                        delete transform.thousandsSeparator;
                    }
                }

                if (transform.type == 'addField') {
                    angular.forEach(transform.fields, function (field) {
                        if ($scope.dimensionsMetrics[field.field] == 'decimal' || $scope.dimensionsMetrics[field.field] == 'number') {
                            field.value = Number(field.value);
                        }

                        if ($scope.dimensionsMetrics[field.field] == 'date' || $scope.dimensionsMetrics[field.field] == 'datetime') {
                            if(field.value != '[__date]') {
                                field.value = DateFormatter.getFormattedDate(field.value.endDate);
                            }
                        }

                        if ($scope.dimensionsMetrics[field.field] == 'text' || $scope.dimensionsMetrics[field.field] == 'largeText') {
                            angular.forEach(allFields, function (item) {
                                var key = angular.copy(item.key).replace(/\$/g, '$$$$');

                                var regExp = new RegExp(item.label.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"), "g");
                                field.value = field.value.replace(regExp, key);
                            });
                        }
                    })

                }

                if (transform.type == 'augmentation') {
                    delete transform.allFieldsDataSet;

                    angular.forEach(transform.customCondition, function (custom) {
                        if (angular.isObject(custom.value)) {
                            custom.value = DateFormatter.getFormattedDate(custom.value.endDate);
                        }
                    })
                }

                if (transform.type == 'addCalculatedField') {
                    angular.forEach(transform.fields, function (field) {
                        angular.forEach(allFields, function (item) {
                            var key = angular.copy(item.key).replace(/\$/g, '$$$$');

                            var regExp = new RegExp(item.label.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"), "g");
                            field.expression = field.expression.replace(regExp, key);
                        });
                    })
                }
            });

            var temporaryFields = [];
            angular.forEach(connectDataSource.temporaryFields, function (field) {
                temporaryFields.push('__$$TEMP$$' + field);
            });

            connectDataSource.temporaryFields = temporaryFields;

            delete connectDataSource.userReorderTransformsAllowed;

            return connectDataSource;
        }

        function _removeFieldInRequires() {
            var requires = angular.copy($scope.connectDataSource.requires);

            angular.forEach(requires, function (require) {
                var index = _.findIndex(REPORT_VIEW_INTERNAL_FIELD_VARIABLE, function (variable) {
                    return variable.key == require
                });

                if(_.values($scope.connectDataSource.mapFields).indexOf(require) == -1 && index == -1) {
                    delete  $scope.connectDataSource.requires[$scope.connectDataSource.requires.indexOf(require)]
                }
            });
        }
        
        function _listenTransform() {
            angular.forEach($scope.connectDataSource.transforms, function (transform) {
                if(transform.type == 'extractPattern') {
                    angular.forEach(transform.fields, function (field) {
                        if(!field.isOverride && ($scope.dimensionsMetrics[field.targetField] == 'date' || $scope.dimensionsMetrics[field.targetField] == 'datetime')) {
                            var indexTransformDate = _.findIndex($scope.connectDataSource.transforms, function (transform) {
                                return  transform.field == field.targetField
                            });

                            if(indexTransformDate == -1) {
                                $scope.connectDataSource.transforms.push({
                                    field: field.targetField,
                                    type: 'date',
                                    to: 'YYYY-MM-DD',
                                    openStatus: true,
                                    from: [{isCustomFormatDateFrom: false, format: null}]
                                })
                            }
                        }
                    });
                }
            })
        }

        function _getAllFieldInTransform(transforms){
            var fields = [];

            angular.forEach(transforms, function (transform){
                if (transform.type == 'addField' || transform.type == 'addCalculatedField' || transform.type == 'comparisonPercent' || transform.type == 'addConcatenatedField') {
                    angular.forEach(transform.fields, function (field){
                        if (!!field.field) {
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
            });

            return fields;
        }

        function _getFieldsForRequires() {
            $scope.totalFields.fieldsForRequires = connectedDataSourceService.inputFormatFieldDataSet(_.uniq(_.values($scope.connectDataSource.mapFields))).concat(REPORT_VIEW_INTERNAL_FIELD_VARIABLE)
        }
    }
})();