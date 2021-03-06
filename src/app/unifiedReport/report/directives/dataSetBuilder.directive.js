(function () {
    'use strict';

    angular.module('tagcade.unifiedReport.report')
        .directive('builderDataSet', builderDataSet)
    ;

    function builderDataSet($compile, _) {
        'use strict';

        return {
            scope: {
                dataSets: '=listDataSets',
                reportBuilder: '=',
                disabled: '='
            },
            restrict: 'AE',
            templateUrl: 'unifiedReport/report/directives/dataSetBuilder.tpl.html',
            compile: function (element, attrs) {
                var content, directive;
                content = element.contents().remove();
                return function (scope, element, attrs) {
                    scope.addDataSet = addDataSet;
                    scope.removeDataSet = removeDataSet;
                    scope.selectDataSet = selectDataSet;
                    scope.toggleField = toggleField;
                    scope.hasField = hasField;
                    scope.getDataSets = getDataSets;
                    scope.selectAllDimensionsMetrics = selectAllDimensionsMetrics;

                    function selectAllDimensionsMetrics(dataSet) {
                        if(dataSet.selectAllDimensionsMetrics) {
                            angular.forEach(dataSet.tempDimensions, function (field) {
                                toggleField(field, dataSet.dimensions, dataSet, true);
                            });

                            angular.forEach(dataSet.tempMetrics, function (field) {
                                toggleField(field, dataSet.metrics, dataSet, true);
                            })
                        } else {
                            angular.forEach(dataSet.tempDimensions, function (field) {
                                var index = dataSet.dimensions.indexOf(field);

                                dataSet.dimensions.splice(index, 1);
                            });

                            angular.forEach(dataSet.tempMetrics, function (field) {
                                var index = dataSet.metrics.indexOf(field);

                                dataSet.metrics.splice(index, 1);
                            });

                            dataSet.fields = dataSet.dimensions.concat(dataSet.metrics);
                        }
                    }
                    
                    function getDataSets(itemDataSet) {
                        return _.filter(scope.dataSets, function (dataSet) {
                            if(!!itemDataSet && ((angular.isObject(itemDataSet) && itemDataSet.id == dataSet.id) || itemDataSet == dataSet.id)) {
                                return true;
                            }

                            for(var index in scope.reportBuilder.reportViewDataSets) {
                                var reportBuilderItemDataSet = scope.reportBuilder.reportViewDataSets[index];

                                if(reportBuilderItemDataSet.dataSet == dataSet.id ||
                                    (angular.isObject(reportBuilderItemDataSet.dataSet)) && reportBuilderItemDataSet.dataSet.id == dataSet.id)
                                {
                                    return false
                                }
                            }

                            return true;
                        })
                    }

                    function hasField(filed, data) {
                        return data.indexOf(filed) > -1;
                    }

                    function toggleField(filed, data, dataSet, notRemove) {
                        var index = data.indexOf(filed);

                        if (index == -1) {
                            data.push(filed);
                        } else {
                            if(!notRemove) {
                                data.splice(index, 1);
                            }
                        }

                        dataSet.fields = dataSet.dimensions.concat(dataSet.metrics);
                    }

                    function selectDataSet(item, dataSet) {
                        dataSet.dimensions = [];
                        dataSet.metrics = [];
                        dataSet.filters = [];

                        dataSet.tempDimensions = _.keys(item.dimensions);
                        dataSet.tempMetrics = _.keys(item.metrics);
                        dataSet.dimensionsMetrics = angular.extend(angular.copy(item.dimensions), angular.copy(item.metrics));
                        dataSet.allFields = dataSet.tempDimensions.concat(dataSet.tempMetrics);
                    }
                    
                    function removeDataSet(index) {
                        scope.reportBuilder.reportViewDataSets.splice(index, 1);

                        scope.reportBuilder.formats = [];

                        if(!scope.reportBuilder.id) {
                            scope.reportBuilder.requireJoin = true;
                        }
                    }
                    
                    function addDataSet() {
                        scope.reportBuilder.reportViewDataSets.push({
                            filters: [],
                            dimensions: [],
                            metrics: [],
                            tempDimensions: [],
                            tempMetrics: [],
                            dimensionsMetrics: [],
                            fields: []
                        });

                        scope.reportBuilder.formats = [];
                    }

                    directive || (directive = $compile(content));

                    element.append(directive(scope, function ($compile) {
                        return $compile;
                    }));
                }
            }
        };
    }
})();