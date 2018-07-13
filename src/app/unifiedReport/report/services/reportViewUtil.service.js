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
            isShowHelpBlock: isShowHelpBlock,
            isAFieldInJoinBy: isAFieldInJoinBy,
            getJoinOutputName: getJoinOutputName
        };

        /**
         *
         * @param fieldWithDatasetIdNeedCheck Ex: tag_name_1
         * @param dataSetIdNeedCheck Ex: 1
         * @param joinData Ex: "joinData": [
         {
           "joinFields": [
             {
               "dataSet": 1,
               "field": "tag_name"
             },
             {
               "dataSet": 2,
               "field": "tag_name"
             }
           ],
           "outputField": "tag_name_join",
           "isVisible": true
         },
         {...}
         ]
         * @returns {*} Ex: tag_name_join
         */
        function getJoinOutputName(fieldWithDatasetIdNeedCheck, dataSetIdNeedCheck, joinData) {
            if (!joinData || joinData.isVisible) return false;
            var outputField = null;
            _.forEach(joinData, function (joinItem) {
                if (!joinItem.joinFields || outputField) return;
                _.forEach(joinItem.joinFields, function (joinObject) {
                    if (joinObject.field + '_' + joinObject.dataSet === fieldWithDatasetIdNeedCheck &&
                        dataSetIdNeedCheck == joinObject.dataSet) {
                        outputField = joinItem.outputField;
                        return;
                    }
                })
            });

            return outputField;
        }

        /**
         *
         * @param fieldWithDatasetIdNeedCheck Ex: tag_name_1
         * @param dataSetIdNeedCheck Ex: 1
         * @param joinData Ex: "joinData": [
         {
           "joinFields": [
             {
               "dataSet": 1,
               "field": "tag_name"
             },
             {
               "dataSet": 2,
               "field": "tag_name"
             }
           ],
           "outputField": "tag_name_join",
           "isVisible": true
         },
         {...}
         ]
         * @returns {boolean} Ex: true
         */
        function isAFieldInJoinBy(fieldWithDatasetIdNeedCheck, dataSetIdNeedCheck, joinData) {
            if (!joinData || joinData.isVisible) return false;
            var found = false;
            _.forEach(joinData, function (joinItem) {
                if (!joinItem.joinFields || found) return;
                _.forEach(joinItem.joinFields, function (joinObject) {
                    if (joinObject.field + '_' + joinObject.dataSet === fieldWithDatasetIdNeedCheck &&
                        dataSetIdNeedCheck == joinObject.dataSet) {
                        found = true;
                        return;
                    }
                })
            });
            return found;
        }

        /**
         * Filters are in reportView.reportViewDatasets, but to subReportView's filters are in reportView.filters
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