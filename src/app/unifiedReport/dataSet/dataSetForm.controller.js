(function() {
    'use strict';

    angular.module('tagcade.unifiedReport.dataSet')
        .controller('dataSetForm', dataSetForm);

    function dataSetForm($scope, _, $modal, UnifiedReportDataSetManager, $translate, dataSources, dataSet, publishers, AlertService, ServerErrorProcessor, historyStorage, HISTORY_TYPE_PATH, METRICS_SET, DIMENSIONS_SET) {
        $scope.isNew = (dataSet === null);
        $scope.publishers = publishers;
        $scope.dataSources = dataSources;

        $scope.dataSet = dataSet || {
            dimensions: [{type: null, name: null}],
            metrics: [{type: null, name: null}],
            actions: {
                rename: [
                ]
            }
            // connectedDataSources: []
        };

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
        $scope.isFormValid = isFormValid;
        $scope.changeName = changeName;

        function changeName(isFieldOld, valueNew, valueOld) {
            if(isFieldOld) {
                var index = _.findIndex($scope.dataSet.actions.rename, function(item) { return item.from == valueOld});
                if(index > -1) {
                    $scope.dataSet.actions.rename[index].to = valueNew
                } else {
                    $scope.dataSet.actions.rename.push({from: valueOld, to: valueNew})
                }
            }
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

        function removeDimension($index) {
            if ($index < $scope.initialDimensionSetLength) {
                $scope.initialDimensionSetLength--;
            }
            return $scope.dataSet.dimensions.splice($index, 1);
        }

        function addNewMetric() {
            return $scope.dataSet.metrics.push({type: null, name: null});
        }

        function removeMetric($index) {
            if ($index < $scope.initialMetricSetLength) {
                $scope.initialMetricSetLength--;
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

            saveDataSet.catch(function(response) {
                var errorCheck = ServerErrorProcessor.setFormValidationErrors(response, $scope.dataSetForm, $scope.fieldNameTranslations);
                $scope.formProcessing = false;

                return errorCheck;
            }).then(function() {
                AlertService.addFlash({
                    type: 'success',
                    message: $scope.isNew ? $translate.instant('UNIFIED_REPORT_DATA_SET_MODULE.ADD_NEW_SUCCESS') : $translate.instant('UNIFIED_REPORT_DATA_SET_MODULE.UPDATE_SUCCESS')
                });
            }).then(function() {
                return historyStorage.getLocationPath(HISTORY_TYPE_PATH.dataSet, '^.list');
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

            delete dataSet.connectedDataSources;

            return dataSet;
        }

        function isFormValid() {
            var allField = $scope.dataSet.dimensions.concat($scope.dataSet.metrics);
            for(var index in allField) {
                if(unValidNameDimensionsMetrics(allField[index].name)) {
                    return false
                }
            }

            return $scope.dataSetForm.$valid;
        }
    }
})();