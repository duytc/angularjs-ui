(function () {
    'use strict';

    angular.module('tagcade.unifiedReport.report')
        .directive('builderReportView', builderReportView)
    ;

    function builderReportView($compile, _) {
        'use strict';

        return {
            scope: {
                reportViews: '=listReportViews',
                dataSets: '=listDataSets',
                reportBuilder: '=',
                subReportsIncluded: '='
            },
            restrict: 'AE',
            templateUrl: 'unifiedReport/report/directives/reportViewBuilder.tpl.html',
            compile: function (element, attrs) {
                var content, directive;
                content = element.contents().remove();
                return function (scope, element, attrs) {
                    scope.addReportView = addReportView;
                    scope.removeReportView = removeReportView;
                    scope.selectReportView = selectReportView;
                    scope.toggleField = toggleField;
                    scope.hasField = hasField;
                    scope.getReportView = getReportView;
                    scope.selectAllDimensionsMetrics = selectAllDimensionsMetrics;

                    function selectAllDimensionsMetrics(reportView) {
                        if(reportView.selectAllDimensionsMetrics) {
                            if(scope.subReportsIncluded) {
                                angular.forEach(reportView.tempDimensions, function (field) {
                                    toggleField(field, reportView.dimensions, reportView, true);
                                });
                            }

                            angular.forEach(reportView.tempMetrics, function (field) {
                                toggleField(field, reportView.metrics, reportView, true);
                            })
                        } else {
                            reportView.dimensions = [];
                            reportView.metrics = [];
                        }
                    }

                    function getReportView(itemReportView) {
                        return _.filter(scope.reportViews, function (reportView) {
                            if(!!itemReportView && ((angular.isObject(itemReportView) && itemReportView.id == reportView.id) || itemReportView == reportView.id)) {
                                return true;
                            }

                            for(var index in scope.reportBuilder.reportViews) {
                                var reportBuilderItemReportView = scope.reportBuilder.reportViews[index];

                                if(reportBuilderItemReportView.reportViewId == reportView.id ||
                                    (angular.isObject(reportBuilderItemReportView.reportViewId)) && reportBuilderItemReportView.reportViewId.id == reportView.id)
                                {
                                    return false
                                }
                            }

                            return true;
                        })
                    }

                    function hasField(filed, data) {
                        return data.indexOf(filed.key) > -1;
                    }

                    function toggleField(filed, data, reportView, notRemove) {
                        var index = data.indexOf(filed.key);

                        if (index == -1) {
                            data.push(filed.key);
                        } else {
                            if(!notRemove) {
                                data.splice(index, 1);
                            }
                        }

                        _setReportViewField(reportView);
                    }

                    function selectReportView(item, reportView) {
                        reportView.dimensions = [];
                        reportView.metrics = [];
                        reportView.filters = [];

                        _setTempDimensions(item, reportView, scope.reportBuilder.showDataSetName);
                        _setTempMetrics(item, reportView, scope.reportBuilder.showDataSetName);

                        reportView.dimensionsMetrics = reportView.tempDimensions.concat(angular.copy(reportView.tempMetrics));
                    }
                    
                    function removeReportView(index) {
                        scope.reportBuilder.reportViews.splice(index, 1);
                    }
                    
                    function addReportView() {
                        scope.reportBuilder.reportViews.push({
                            filters: [],
                            dimensions: [],
                            metrics: [],
                            tempDimensions: [],
                            tempMetrics: [],
                            dimensionsMetrics: [],
                            fields: []
                        })
                    }

                    function _setTempDimensions(item, reportView, showDataSetName) {

                        reportView.tempDimensions = [];
                        angular.forEach(item.dimensions, function (dimension) {
                            var key = dimension.slice(0, dimension.lastIndexOf('_'));
                            var id = dimension.slice(dimension.lastIndexOf('_') + 1, dimension.length);

                            var dataSet = _.find(scope.dataSets, function (dataSet) {
                                return !!dataSet.dimensions[key] && dataSet.id == id;
                            });

                            if(!!dataSet && showDataSetName){
                                reportView.tempDimensions.push({
                                    key: dimension,
                                    label: key + ' ('+ dataSet.name +')',
                                    type: dataSet.dimensions[key],
                                    dataSetName: !!dataSet ? dataSet.name : null,
                                    hasDataSetName: true
                                })
                            } else {
                                reportView.tempDimensions.push({
                                    key: dimension,
                                    label: key,
                                    type: item.fieldTypes[dimension],
                                    dataSetName: !!dataSet ? dataSet.name : null,
                                    hasDataSetName: false
                                })
                            }
                        });
                    }

                    function _setTempMetrics(item, reportView, showDataSetName) {
                        reportView.tempMetrics = [];
                        angular.forEach(item.metrics, function (metric) {
                            var key = metric.slice(0, metric.lastIndexOf('_'));
                            var id = metric.slice(metric.lastIndexOf('_') + 1, metric.length);

                            var dataSet = _.find(scope.dataSets, function (dataSet) {
                                return !!dataSet.metrics[key] && dataSet.id == id;
                            });

                            if(!!dataSet && showDataSetName) {
                                reportView.tempMetrics.push({
                                    key: metric,
                                    label: key + ' ('+ dataSet.name +')',
                                    type: dataSet.metrics[key],
                                    dataSetName: !!dataSet ? dataSet.name : null,
                                    hasDataSetName: true
                                })
                            } else {
                                reportView.tempMetrics.push({
                                    key: metric,
                                    label: key,
                                    type: item.fieldTypes[metric],
                                    dataSetName: !!dataSet ? dataSet.name : null,
                                    hasDataSetName: false
                                })
                            }
                        });
                    }

                    function _setReportViewField(reportView) {
                        reportView.fields = [];
                        var selectFields = reportView.dimensions.concat(reportView.metrics);

                        angular.forEach(selectFields, function (selectField) {
                            var field = _.find(reportView.dimensionsMetrics, function (dm) {
                                return dm.key == selectField
                            });

                            if(!!field) {
                                reportView.fields.push(field)
                            }
                        })
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