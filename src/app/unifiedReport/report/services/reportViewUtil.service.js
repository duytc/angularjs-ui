(function () {
    'use strict';

    angular.module('tagcade.unifiedReport.report')
        .factory('reportViewUtil', reportViewUtil)
    ;

    function reportViewUtil() {
        return {
            hasCustomFilters: hasCustomFilters
        };

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
            var isDatasetHasUserProvidedFilterExceptDate = false;
            var hasFilter = dataset.filters && dataset.filters.length;

            if (hasFilter) {
                _.forEach(dataset.filters, function (filter) {
                    if (filter.userProvided && filter.type !== 'date') {
                        isDatasetHasUserProvidedFilterExceptDate = true;
                        return;
                    }
                })
            }
            return isDatasetHasUserProvidedFilterExceptDate;
        }

    }
})(angular);