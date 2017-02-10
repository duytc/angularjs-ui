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
                            angular.forEach(reportView.tempDimensions, function (field) {
                                var index = reportView.dimensions.indexOf(field);

                                reportView.dimensions.splice(index, 1);
                            });

                            angular.forEach(reportView.tempMetrics, function (field) {
                                var index = reportView.metrics.indexOf(field);

                                reportView.metrics.splice(index, 1);
                            });

                            _setReportViewField(reportView);
                        }
                    }

                    function getReportView(itemReportView) {
                        return _.filter(scope.reportViews, function (reportView) {
                            if(!!itemReportView && ((angular.isObject(itemReportView) && itemReportView.id == reportView.id) || itemReportView == reportView.id)) {
                                return true;
                            }

                            for(var index in scope.reportBuilder.reportViewMultiViews) {
                                var reportBuilderItemReportView = scope.reportBuilder.reportViewMultiViews[index];

                                if(reportBuilderItemReportView.subView == reportView.id ||
                                    (angular.isObject(reportBuilderItemReportView.subView)) && reportBuilderItemReportView.subView.id == reportView.id)
                                {
                                    return false
                                }
                            }

                            return true;
                        })
                    }

                    function hasField(filed, data) {
                        if (data instanceof Array ) {
	                        return data.indexOf(filed.key) > -1;
                        }
                    }

                    function toggleField(filed, data, reportView, notRemove) {

                        if (data instanceof Array) {
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
                    }

                    function selectReportView(item, reportView) {
                        reportView.dimensions = [];
                        reportView.metrics = [];
                        reportView.filters = [];

                        _setTempDimensions(item, reportView);
                        _setTempMetrics(item, reportView);

                        reportView.dimensionsMetrics = reportView.tempDimensions.concat(angular.copy(reportView.tempMetrics));
                    }
                    
                    function removeReportView(index) {
                        scope.reportBuilder.reportViewMultiViews.splice(index, 1);
                    }
                    
                    function addReportView() {
                        scope.reportBuilder.reportViewMultiViews.push({
                            filters: [],
                            dimensions: [],
                            metrics: [],
                            tempDimensions: [],
                            tempMetrics: [],
                            dimensionsMetrics: [],
                            fields: []
                        })
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

                            var dataSet = _.find(scope.dataSets, function (dataSet) {
                                return !!dataSet.dimensions[key] && dataSet.id == id;
                            });

                            if(!!dataSet){
                                reportView.tempDimensions.push({
                                    key: dimension,
                                    label: key + ' ('+ dataSet.name +')',
                                    type: dataSet.dimensions[key]
                                })
                            } else {
                                reportView.tempDimensions.push({
                                    key: dimension,
                                    label: dimension,
                                    type: item.fieldTypes[dimension]
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

                            var dataSet = _.find(scope.dataSets, function (dataSet) {
                                return !!dataSet.metrics[key] && dataSet.id == id;
                            });

                            if(!!dataSet) {
                                reportView.tempMetrics.push({
                                    key: metric,
                                    label: key + ' ('+ dataSet.name +')',
                                    type: dataSet.metrics[key]
                                })
                            } else {
                                reportView.tempMetrics.push({
                                    key: metric,
                                    label: metric,
                                    type: item.fieldTypes[metric]
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