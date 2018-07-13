(function () {
    'use strict';

    angular.module('tagcade.unifiedReport.report')
        .factory('reportViewUtil', reportViewUtil)
    ;

    function reportViewUtil() {
        return {
            hasCustomFilters: hasCustomFilters,
            _buildCustomFilters: _buildCustomFilters,
            isDatasetHasUserProvidedFilterExceptDate: isDatasetHasUserProvidedFilterExceptDate,
            isShowHelpBlock: isShowHelpBlock
        };

        /**
         * Filters is in reportView.reportViewDatasets, but to subReportView, filter is in reportView.filters
         * Need push reportView.filters into reportView.reportViewDatasets to submit to api
         * @private
         */
        function _buildCustomFilters(subReportViewFilters, reportViewDataSets) {
            _.forEach(subReportViewFilters, function (subReportViewFilter) {
                if (!subReportViewFilter.userProvided || subReportViewFilter.type === 'date') {
                    return;
                }
                var dataset = reportViewDataSets.find(function (reportViewDataSet) {
                    return reportViewDataSet.dataSet == subReportViewFilter.dataSet;
                });
                if (dataset) {
                    dataset.filters.push(subReportViewFilter);
                }
            });
        }

        function hasCustomFilters(reportViewDatasets) {
            var isShowCustomFilter = false;
            _.forEach(reportViewDatasets, function (dataset) {
                if (isDatasetHasUserProvidedFilterExceptDate(dataset)) {
                    isShowCustomFilter = true;
                    return;
                }
            });
            return isShowCustomFilter;
        }

        function isDatasetHasUserProvidedFilterExceptDate(dataset) {
            var result = false;
            var hasFilter = dataset.filters && dataset.filters.length > 0;

            if (hasFilter) {
                _.forEach(dataset.filters, function (filter) {
                    if (filter.userProvided && filter.type !== 'date') {
                        result = true;
                        return;
                    }
                })
            }
            return result;
        }

        function isShowHelpBlock(customFilter) {
            return customFilter &&
                (customFilter.comparison === 'contains' ||
                    customFilter.comparison === 'not contains' ||
                    customFilter.comparison === 'start with' ||
                    customFilter.comparison === 'end with');
        }

    }
})(angular);