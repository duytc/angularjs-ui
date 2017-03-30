(function() {
    'use strict';

    angular.module('tagcade.unifiedReport.connect')
        .controller('ConnectDataSourceForm', ConnectDataSourceForm);

    function ConnectDataSourceForm($scope, $modal, $timeout, _, dataSets, dataSources, connectDataSource, AlertService, sessionStorage, FileUploader, UnifiedReportConnectDataSourceManager, UnifiedReportDataSourceManager, ServerErrorProcessor, dataSet, dateUtil, historyStorage, HISTORY_TYPE_PATH, REPORT_VIEW_INTERNAL_FIELD_VARIABLE, DateFormatter) {
        const ALERT_CODE_DATA_IMPORT_MAPPING_FAIL = 1201;
        const ALERT_CODE_DATA_IMPORT_REQUIRED_FAIL = 1202;
        const ALERT_CODE_FILTER_ERROR_INVALID_NUMBER = 1203;
        const ALERT_CODE_TRANSFORM_ERROR_INVALID_DATE = 1204;
        const ALERT_CODE_DATA_IMPORT_NO_HEADER_FOUND = 1205;
        const ALERT_CODE_DATA_IMPORT_NO_DATA_ROW_FOUND = 1206;
        const ALERT_CODE_WRONG_TYPE_MAPPING = 1207;
        const ALERT_CODE_FILE_NOT_FOUND = 1208;
        const ALERT_CODE_NO_FILE_PREVIEW = 1209;
        const ALERT_CODE_UN_EXPECTED_ERROR = 2000;

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
            requires: [],
            filters: [],
            transforms: [],
            alertSetting: [],
            replayData: true,
            userReorderTransformsAllowed: false
        };

        $scope.selected = {
        };

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
                listDetectFields.push(response.filePath);

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

        $scope.isFormValid = isFormValid;
        $scope.submit = submit;
        $scope.toggleField = toggleField;
        $scope.hasField = hasField;
        $scope.labelField = labelField;
        $scope.isEmpty = isEmpty;
        $scope.backToConnectDataSourceList = backToConnectDataSourceList;
        $scope.getMapFieldValues = getMapFieldValues;
        $scope.hasAlertSetting = hasAlertSetting;
        $scope.toggleAlertSetting = toggleAlertSetting;
        $scope.selectDataSource = selectDataSource;
        $scope.selectMapField = selectMapField;
        $scope.previewData = previewData;
        
        function previewData() {
            var connectDataSource = _refactorJson($scope.connectDataSource);
            connectDataSource.isDryRun = true;
            connectDataSource.filePaths = listDetectFields;
            connectDataSource.connectedDataSourceId = $scope.connectDataSource.id;

            UnifiedReportConnectDataSourceManager.one('dryrun').post(null, connectDataSource)
                .then(function (reportData) {
                    $modal.open({
                        templateUrl: 'unifiedReport/connectDataSource/previewData.tpl.html',
                        size: 'lg',
                        controller: 'PreviewDataConnect',
                        resolve: {
                            reportData: function () {
                                return reportData;
                            }
                        }
                    });
                })
                .catch(function (response) {
                    AlertService.replaceAlerts({
                        type: 'error',
                        message: convertMessage(response.data.message)
                    });
                })
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
                        to: 'Y-m-d',
                        openStatus: true
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

        function getMapFieldValues(mapFields) {
            return _.union(_.values(mapFields).concat(REPORT_VIEW_INTERNAL_FIELD_VARIABLE));
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
            // $scope.connectDataSource.mapFields = {};
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

                if((transform.type != 'number' && transform.type != 'date' && transform.type != 'augmentation')) {
                    if (_.isUndefined(transform.fields) || transform.fields.length == 0) {
                        return false;
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

            var connectDataSource = _refactorJson($scope.connectDataSource);
            connectDataSource.filePaths = listDetectFields;

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
            ;
        }

        function _refactorJson(connectDataSource) {
            connectDataSource = angular.copy(connectDataSource);

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
                            field.value = DateFormatter.getFormattedDate(field.value.endDate);
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
            });

            return connectDataSource;
        }

        update();
        function update() {
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

                angular.forEach($scope.connectDataSource.transforms, function (transform) {
                    if(transform.type == 'addField') {
                        angular.forEach(transform.fields, function (field) {
                            if($scope.dimensionsMetrics[field.field] == 'datetime' || $scope.dimensionsMetrics[field.field] == 'date') {
                                field.value = {endDate: field.value}
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
                });
            }
        }

        $scope.$watch(function () {
            return $scope.connectDataSource.mapFields
        }, function () {
            _removeFieldInRequires();
            _removeFieldInFilter();
            _removeFieldInTransform();
        }, true);

        $scope.$watch(function () {
            return $scope.connectDataSource.transforms
        }, function () {
            _listenTransform();
            _removeFieldInTransform();
        }, true);

        function _removeFieldInRequires() {
            var requires = angular.copy($scope.connectDataSource.requires);

            angular.forEach(requires, function (require) {
                if(_.values($scope.connectDataSource.mapFields).indexOf(require) == -1 && REPORT_VIEW_INTERNAL_FIELD_VARIABLE.indexOf(require) == -1) {
                    delete  $scope.connectDataSource.requires[$scope.connectDataSource.requires.indexOf(require)]
                }
            });
        }
        
        function _removeFieldInFilter() {
            //var filters = angular.copy($scope.connectDataSource.filters);
            //
            //angular.forEach(filters, function (filter) {
            //    if(_.values($scope.connectDataSource.mapFields).indexOf(filter.field) == -1) {
            //        var index = _.findIndex($scope.connectDataSource.filters, function (item) {
            //            return item.field == filter.field;
            //        });
            //
            //        if(index > -1) {
            //            $scope.connectDataSource.filters.splice(index, 1)
            //        }
            //    }
            //});
        }
        
        function _removeFieldInTransform() {
            var transforms = angular.copy($scope.connectDataSource.transforms);
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
                        if(_.values($scope.connectDataSource.mapFields).indexOf(transform.field) == -1 && allFieldAdd.indexOf(transform.field) == -1) {
                            var index = _.findIndex($scope.connectDataSource.transforms, function (item) {
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
                                $scope.connectDataSource.transforms.splice(index, 1)
                            }
                        }
                    }
                }, 0, true);
            });

            angular.forEach($scope.connectDataSource.transforms, function (transform) {
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
                            if(_.values($scope.connectDataSource.mapFields).indexOf(transformField.targetField) > -1) {
                                transformField.targetField = null
                            }
                        }
                    })
                }

                if(transform.type == 'replaceText') {
                    // angular.forEach(transform.fields, function (field) {
                    //     if(Object.keys($scope.connectDataSource.mapFields).indexOf(field.field) == -1
                    //         || ($scope.dimensionsMetrics[$scope.connectDataSource.mapFields[field.field]] != 'text'
                    //         && $scope.dimensionsMetrics[$scope.connectDataSource.mapFields[field.field]] != 'multiLineText')) {
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

                if(transform.type == 'addField' || transform.type == 'comparisonPercent' || transform.type == 'addCalculatedField' || transform.type == 'addConcatenatedField') {
                    angular.forEach(transform.fields, function (field) {
                        if(_.values($scope.connectDataSource.mapFields).indexOf(field.field) > -1) {
                            $timeout(function () {
                                field.field = null
                            }, 0, true);
                        }
                    });
                }

                if (transform.type == 'comparisonPercent') {
                    //angular.forEach(transform.fields, function (field) {
                    //    if(_.values($scope.connectDataSource.mapFields).indexOf(field.denominator) == -1) {
                    //        field.denominator = null
                    //    }
                    //
                    //    if(_.values($scope.connectDataSource.mapFields).indexOf(field.numerator) == -1) {
                    //        field.numerator = null
                    //    }
                    //});
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
                                    to: 'Y-m-d',
                                    openStatus: true
                                })
                            }
                        }
                    });
                }
            })
        }

        function convertMessage(message) {
            message = angular.fromJson(message);

            var code = message.code;
            var detail = message.detail;

            switch (code) {
                case ALERT_CODE_DATA_IMPORT_MAPPING_FAIL:
                    return 'Cannot preview data - no field in file is mapped to data set.';

                case ALERT_CODE_WRONG_TYPE_MAPPING:
                    return 'Cannot preview data - MAPPING ERROR: Found invalid content ' + '"' + detail.content + '"' + ' on field ' + '"' + detail.column + '"' + '.';

                case ALERT_CODE_DATA_IMPORT_REQUIRED_FAIL:
                    return 'Cannot preview data - REQUIRE ERROR: Required field ' + '"' + detail.column + '"' + ' dose not exist.';

                case ALERT_CODE_FILTER_ERROR_INVALID_NUMBER:
                    return 'Cannot preview data - TRANSFORM ERROR: Invalid number format on field ' + '"' + detail.column + '"' + '.';

                case ALERT_CODE_TRANSFORM_ERROR_INVALID_DATE:
                    return 'Cannot preview data - TRANSFORM ERROR: Invalid date format on field ' + '"' + detail.column + '"' + '.';

                case ALERT_CODE_DATA_IMPORT_NO_HEADER_FOUND:
                    return 'Cannot preview data - the file in data source has no data.';

                case ALERT_CODE_DATA_IMPORT_NO_DATA_ROW_FOUND:
                    return 'Cannot preview data - the file in data source has no data.';

                case ALERT_CODE_FILE_NOT_FOUND:
                    return 'Cannot preview data - file does not exist.';

                case ALERT_CODE_UN_EXPECTED_ERROR:
                    return 'Cannot preview data - unexpected error, please contact your account manager';

                case ALERT_CODE_NO_FILE_PREVIEW:
                    return 'cannot find any file in this data source for dry run';

                default:
                    return 'Unknown code (' + detail.code + ')';
            }
        }
    }
})();