(function() {
    'use strict';

    angular.module('tagcade.unifiedReport.dataSet')
        .controller('dataSetForm', dataSetForm);

    function dataSetForm($scope, _, $modal, UnifiedReportDataSetManager, $translate, dataSources, dataSet, dataSets, publishers, AlertService, ServerErrorProcessor, historyStorage, HISTORY_TYPE_PATH, METRICS_SET, DIMENSIONS_SET) {
        $scope.isNew = (dataSet === null);
        $scope.publishers = publishers;
        $scope.dataSets = dataSets;
        $scope.dataSources = dataSources;
        $scope.totalDimensionsMetrics = [];

        $scope.dataSet = dataSet || {
            allowOverwriteExistingData: true,
            dimensions: [{type: null, name: null}],
            metrics: [],
            mapBuilderEnabled: false,
            mapBuilderConfigs: [],
            actions: {
                rename: [
                ]
            }
            // connectedDataSources: []
        };

        $scope.$watch(function (){
            return $scope.dataSet;
        }, function (){
            $scope.totalDimensionsMetrics = [];

            angular.forEach($scope.dataSet.dimensions.concat($scope.dataSet.metrics), function (field) {
                if(!!field.name) {
                    $scope.totalDimensionsMetrics.push(field.name)
                }
            })
        }, true);

        $scope.dimensionSet = DIMENSIONS_SET;
        $scope.metricSet = METRICS_SET;

        $scope.formProcessing = false;

        $scope.initialDimensionSetLength = 0;
        $scope.initialMetricSetLength = 0;

        if(!$scope.isNew) {
            var metrics = [];
            angular.forEach($scope.dataSet.metrics, function (metric, key) {
                metrics.push({name: key, type:metric})
            });

            var dimensions = [];
            angular.forEach($scope.dataSet.dimensions, function (dimension, key) {
                dimensions.push({name: key, type:dimension});
            });

            $scope.dataSet.metrics = metrics;
            $scope.dataSet.dimensions = dimensions;
            $scope.initialDimensionSetLength = $scope.dataSet.dimensions.length;
            $scope.initialMetricSetLength = $scope.dataSet.metrics.length;

            if(!$scope.dataSet.actions) {
                $scope.dataSet.actions = {
                    rename: [
                    ]
                }
            }

            angular.forEach($scope.dataSet.mapBuilderConfigs, function (mapBuilderConfig) {
                if(mapBuilderConfig.leftSide) {
                    $scope.dataSet.leftSide = mapBuilderConfig.name
                } else {
                    $scope.dataSet.rightSide = mapBuilderConfig.name
                }

                var mapFields = [];

                angular.forEach(mapBuilderConfig.mapFields, function (value, key) {
                    mapFields.push({key: key, value: value});
                });

                mapBuilderConfig.mapFields = mapFields;
            });

            $scope.dataSetClone = angular.copy(dataSet);
        }

        $scope.backToDataSetList = backToDataSetList;
        $scope.addNewDimension = addNewDimension;
        $scope.removeDimension = removeDimension;
        $scope.addNewMetric = addNewMetric;
        $scope.removeMetric = removeMetric;
        $scope.addNewConnectedDataSource = addNewConnectedDataSource;
        $scope.removeConnectedDataSource = removeConnectedDataSource;
        $scope.unValidNameDimensionsMetrics= unValidNameDimensionsMetrics;
        $scope.submit = submit;
        // $scope.getMapBuilder = getMapBuilder;
        $scope.isFormValid = isFormValid;
        $scope.changeName = changeName;
        $scope.selectType = selectType;
        $scope.checkMapBuilder = checkMapBuilder;

        function checkMapBuilder(mapBuilderEnabled) {
            if(mapBuilderEnabled) {
                $scope.dataSet.allowOverwriteExistingData = true;
            }
        }

        function selectType(dm) {
            _resetValue(dm)
        }

        function changeName(isFieldOld, valueNew, valueOld) {
            if(isFieldOld) {
                var index = _.findIndex($scope.dataSet.actions.rename, function(item) { return item.from == valueOld});
                if(index > -1) {
                    $scope.dataSet.actions.rename[index].to = valueNew
                } else {
                    $scope.dataSet.actions.rename.push({from: valueOld, to: valueNew})
                }
            }

            angular.forEach($scope.dataSet.mapBuilderConfigs, function (mapBuilderConfig) {
                angular.forEach(mapBuilderConfig.mapFields, function (field) {
                    if(field.key == valueOld) {
                        field.key = null;
                    }
                });
            });
        }

        function unValidNameDimensionsMetrics(name) {
            if(!/^[a-zA-Z_][a-zA-Z0-9_$\s]*$/.test(name)) {
                return true
            }

            var fields = [];

            angular.forEach($scope.dataSet.dimensions.concat($scope.dataSet.metrics), function (field) {
                fields.push(field.name);
            });

            return _.filter(fields, function(field){ return name == field && name != null; }).length > 1;
        }

        function backToDataSetList() {
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.dataSet, '^.list');
        }

        function addNewDimension() {
            return $scope.dataSet.dimensions.push({type: null, name: null});
        }

        function removeDimension($index, dimentsion) {
            _removeMapField(dimentsion);

            if ($index < $scope.initialDimensionSetLength) {
                $scope.initialDimensionSetLength--;
            }
            return $scope.dataSet.dimensions.splice($index, 1);
        }

        function addNewMetric() {
            return $scope.dataSet.metrics.push({type: null, name: null});
        }

        function removeMetric($index, metric) {
            _removeMapField(metric);

            if ($index < $scope.initialMetricSetLength) {
                $scope.initialMetricSetLength--;
            }

            var findIndexActionRename = _.findIndex($scope.dataSet.actions.rename, function (item) {
                return  item.to == $scope.dataSet.metrics[$index].name;
            });

            if(findIndexActionRename > -1) {
                var findIndexDimension = _.findIndex($scope.dataSet.dimensions, function (item) {
                    return  item.name == $scope.dataSet.metrics[$index].name;
                });

                if(findIndexDimension == -1) {
                    $scope.dataSet.actions.rename.splice(findIndexActionRename, 1)
                }
            }

            return $scope.dataSet.metrics.splice($index, 1);
        }

        function addNewConnectedDataSource() {
            var connectDataSource = {
                dataSource: null,
                mapFields: {},
                requires: {},
                filters: {},
                transforms: {}
            };

            var modalInstance = $modal.open({
                templateUrl: 'unifiedReport/connectDataSource/connectDataSourceQuicklyForm.tpl.html',
                controller: 'ConnectDataSourceQuicklyForm',
                size: 'lg',
                resolve: {
                    connectDataSource: function () {
                        return connectDataSource;
                    },
                    dataSources: function () {

                    }
                }
            });

            modalInstance.result
                .then(function () {
                    $scope.dataSet.connectedDataSources.push(connectDataSource);
                })
        }

        function removeConnectedDataSource($index) {
            return $scope.dataSet.connectedDataSources.splice($index, 1);
        }

        function submit() {
            if ($scope.formProcessing) {
                return;
            }

            $scope.formProcessing = true;

            var dataSet = _refactorJson($scope.dataSet);
            var saveDataSet = $scope.isNew ? UnifiedReportDataSetManager.post(dataSet) : UnifiedReportDataSetManager.one(dataSet.id).patch(dataSet);

            saveDataSet.then(function(data) {
                AlertService.addFlash({
                    type: 'success',
                    message: $scope.isNew ? $translate.instant('UNIFIED_REPORT_DATA_SET_MODULE.ADD_NEW_SUCCESS') : $translate.instant('UNIFIED_REPORT_DATA_SET_MODULE.UPDATE_SUCCESS')
                });

                // if($scope.isNew && $scope.dataSet.mapBuilderEnabled) {
                //     return historyStorage.getLocationPath(HISTORY_TYPE_PATH.dataSet, '^.mapBuilder', {dataSet: data.id});
                // }

                return historyStorage.getLocationPath(HISTORY_TYPE_PATH.dataSet, '^.list');
            }).catch(function(response) {
                $scope.formProcessing = false;

                if(!response.data.errors) {
                    return AlertService.replaceAlerts({
                        type: 'error',
                        message: response.data.message
                    });
                }

                var errorCheck = ServerErrorProcessor.setFormValidationErrors(response, $scope.dataSetForm, $scope.fieldNameTranslations);

                return errorCheck;
            })
        }

        // function getMapBuilder() {
        //     // if ($scope.formProcessing) {
        //     //     return;
        //     // }
        //     //
        //     // $scope.formProcessing = true;
        //
        //     var dataSet = _refactorJson($scope.dataSet);
        //     var saveDataSet = $scope.isNew ? UnifiedReportDataSetManager.post(dataSet) : UnifiedReportDataSetManager.one(dataSet.id).patch(dataSet);
        //
        //     saveDataSet
        //         .then(function(response) {
        //             console.log(response);
        //         })
        //         .catch(function(response) {
        //             var errorCheck = ServerErrorProcessor.setFormValidationErrors(response, $scope.dataSetForm, $scope.fieldNameTranslations);
        //             $scope.formProcessing = false;
        //
        //             return errorCheck;
        //         })
        // }

        function _resetValue(dm) {
            angular.forEach($scope.dataSet.mapBuilderConfigs, function (mapBuilderConfig) {
                angular.forEach(mapBuilderConfig.mapFields, function (mapField) {
                    if(mapField.key == dm.name) {
                        mapField.value = null
                    }
                });
            });
        }

        function _removeMapField(dm) {
            angular.forEach($scope.dataSet.mapBuilderConfigs, function (mapBuilderConfig) {
                angular.forEach(angular.copy(mapBuilderConfig.mapFields), function (mapField, index) {
                    if(mapField.key == dm.name) {
                        if(mapBuilderConfig.mapFields.length == 1) {
                            mapBuilderConfig.mapFields[index].key = null;
                            mapBuilderConfig.mapFields[index].value = null;
                        } else {
                            mapBuilderConfig.mapFields.splice(index, 1)
                        }
                    }
                });
            });
        }

        function _refactorJson(dataSet) {
            dataSet = angular.copy(dataSet);

            if (!$scope.isAdmin()) {
                delete dataSet.publisher;
            }

            if (dataSet.hasOwnProperty('createdDate')) {
                delete dataSet.createdDate;
            }

            var metrics = {};
            angular.forEach(dataSet.metrics, function (metric) {
                metrics[metric.name] = metric.type;
            });

            var dimensions = {};
            angular.forEach(dataSet.dimensions, function (dimension) {
                dimensions[dimension.name] = dimension.type;
            });

            dataSet.metrics = metrics;
            dataSet.dimensions = dimensions;

            if(dataSet.mapBuilderEnabled) {
                angular.forEach(dataSet.mapBuilderConfigs, function (mapSideConfig) {
                    delete mapSideConfig.totalDimensionsMetrics;
                    delete mapSideConfig.dataSet;
                    delete mapSideConfig.id;

                    mapSideConfig.mapDataSet = mapSideConfig.mapDataSet.id || mapSideConfig.mapDataSet;

                    var mapFields = {};

                    angular.forEach(mapSideConfig.mapFields, function (mapField) {
                        mapFields[mapField.key] = mapField.value
                    });

                    mapSideConfig.mapFields = mapFields;
                });

                delete dataSet.connectedDataSources;
            } else {
                dataSet.mapBuilderConfigs = []
            }

            delete dataSet.leftSide;
            delete dataSet.rightSide;

            return dataSet;
        }

        function isFormValid() {
            var allField = $scope.dataSet.dimensions;
            for(var index in allField) {
                if(unValidNameDimensionsMetrics(allField[index].name)) {
                    return false
                }
            }

            return $scope.dataSetForm.$valid;
        }
    }
})();