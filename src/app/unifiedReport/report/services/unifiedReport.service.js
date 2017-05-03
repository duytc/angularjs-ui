(function() {
    'use strict';
    
    angular.module('tagcade.unifiedReport.report')
        .factory('unifiedReportBuilder', unifiedReportBuilder)
    ;

    function unifiedReportBuilder(dataService, API_PERFORMANCE_UNIFIED_REPORTS_BASE_URL) {
        var api = {
            getPlatformReport: getPlatformReport,
            parseFieldNameByDataSet: parseFieldNameByDataSet,
            getDataSetsFromReportView: getDataSetsFromReportView
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
    }
})(angular);