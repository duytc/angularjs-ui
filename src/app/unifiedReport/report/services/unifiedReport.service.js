(function() {
    'use strict';
    
    angular.module('tagcade.unifiedReport.report')
        .factory('unifiedReportBuilder', unifiedReportBuilder)
    ;

    function unifiedReportBuilder(dataService, API_PERFORMANCE_UNIFIED_REPORTS_BASE_URL, UnifiedReportDataSetManager) {
        var api = {
            getPlatformReport: getPlatformReport,
            parseFieldNameByDataSet: parseFieldNameByDataSet,
            getDataSetsFromReportView: getDataSetsFromReportView,

            summaryFieldsReportView: summaryFieldsReportView
        };

        return api;

        function getReport(params, extentUrl) {
            if (!params) {
                params = {};
            }

            return dataService.makeHttpPOSTRequest('', params, API_PERFORMANCE_UNIFIED_REPORTS_BASE_URL + extentUrl)
                .catch(function(response) {
                    return {
                        status: response.status,
                        message: response.data.message
                    }
                });
        }

        function getPlatformReport(params) {
            return getReport(params, '/data');
        }

        function parseFieldNameByDataSet(field_id, dataSets) {
            var key = null;
            var id = null;

            if(field_id.lastIndexOf('_') > -1) {
                key = field_id.slice(0, field_id.lastIndexOf('_'));
                id = field_id.slice(field_id.lastIndexOf('_') + 1, field_id.length);

                var dataSet = _.find(dataSets, function (dataSet) {
                    return dataSet.id == id;
                });

                if (!!dataSet) {
                    return key + ' (' + dataSet.name + ')';
                }
            }

            return field_id;
        }

        function getDataSetsFromReportView(reportView) {
            var dataSets = [];

            if(reportView.multiView) {
                angular.forEach(reportView.reportViewMultiViews, function (reportViewMultiView) {
                    angular.forEach(reportViewMultiView.subView.reportViewDataSets, function (reportViewDataSet) {
                        dataSets.push(reportViewDataSet.dataSet)
                    });
                });
            } else {
                angular.forEach(reportView.reportViewDataSets, function (reportViewDataSet) {
                    dataSets.push(reportViewDataSet.dataSet)
                });
            }

            return dataSets;
        }
        
        function summaryFieldsReportView(reportView) {
            return UnifiedReportDataSetManager.getList().then(function (dataSets) {
                var fields = _.union(reportView.dimensions.concat(reportView.metrics));
                var formatFields = [];

                angular.forEach(fields, function (field) {
                    var key = field;
                    var id = null;

                    if(field.lastIndexOf('_') > -1) {
                        key = field.slice(0, field.lastIndexOf('_'));
                        id = field.slice(field.lastIndexOf('_') + 1, field.length);
                    }

                    if(reportView.joinBy.length > 0) {
                        for(var index in reportView.joinBy) {
                            if(reportView.joinBy[index].outputField == field && !reportView.joinBy[index].isVisible) {
                                return
                            }

                            var join = _.find(reportView.joinBy[index].joinFields, function (item) {
                                return item.dataSet == id && item.field == key
                            });

                            if(!!join) {
                                var indexFormatField = _.findIndex(formatFields, function (field) {
                                    return field.key == reportView.joinBy[index].outputField
                                });

                                if(indexFormatField == -1) {
                                    formatFields.push({
                                        key: reportView.joinBy[index].outputField,
                                        label: reportView.joinBy[index].outputField
                                    });
                                }

                                return
                            }
                        }
                    }

                    var dataSet = _.find(dataSets, function (dataSet) {
                        if(key.indexOf('__') > -1 && (key.indexOf('_day') > -1 || key.indexOf('_month') > -1 || key.indexOf('_year') > -1)) {
                            return dataSet.id == id
                        }

                        return (!!dataSet.dimensions[key] || !!dataSet.metrics[key]) && dataSet.id == id;
                    });

                    if(!!dataSet){
                        formatFields.push({
                            key: field,
                            label: key + ' ('+ dataSet.name +')'
                        })
                    } else {
                        formatFields.push({
                            key: field,
                            label: field
                        })
                    }
                });

                angular.forEach(reportView.transforms, function (transform) {
                    if (transform.type == 'addField' || transform.type == 'addCalculatedField' || transform.type == 'comparisonPercent') {
                        angular.forEach(transform.fields, function (field) {
                            var index = _.findIndex(formatFields, function (item) {
                                return item.key == field.field;
                            });

                            if (!!field.field && index == -1) {
                                formatFields.push({
                                    label: field.field,
                                    key: field.field
                                });
                            }
                        })
                    }
                });

                if(reportView.multiView) {
                    formatFields.unshift({
                        key: 'report_view_alias',
                        label: 'Report View Alias'
                    });
                }

                return formatFields;
            });
        }
    }
})(angular);