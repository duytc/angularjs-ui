(function() {
    'use strict';
    
    angular.module('tagcade.unifiedReport.connect')
        .factory('mapBuilderDataSet', mapBuilderDataSet)
    ;

    function mapBuilderDataSet(FIELD_LOCAL_DATA_SET_MAP_BUILDER, dateUtil) {
        var api = {
            removeValues: removeValues,
            refactorFilter: refactorFilter
        };

        return api;

        function removeValues(values) {
            angular.forEach(FIELD_LOCAL_DATA_SET_MAP_BUILDER, function (column) {
                var index = values.indexOf(column);

                if(index > -1) {
                    values.splice(index, 1)
                }
            });

            return values
        }

        function refactorFilter(filters) {
            angular.forEach(filters, function (filter) {
                if (filter.type == 'date') {
                    if (filter.dateType == 'customRange' || filter.dateType == 'userProvided') {
                        filter.dateValue.startDate = dateUtil.getFormattedDate(filter.dateValue.startDate);
                        filter.dateValue.endDate = dateUtil.getFormattedDate(filter.dateValue.endDate);
                    }

                    delete filter.date;
                    delete filter.comparison;
                    delete filter.compareValue;
                }
                if (filter.type == 'number') {
                    delete filter.date;
                    delete filter.startDate;
                    delete filter.endDate;
                    delete filter.format;
                    delete filter.dateValue;
                    delete filter.userProvided;
                }

                if (filter.type == 'text') {
                    delete filter.date;
                    delete filter.startDate;
                    delete filter.endDate;
                    delete filter.format;
                    delete filter.dateValue;
                    delete filter.userProvided;
                }
            });

            return filters
        }
    }
})(angular);