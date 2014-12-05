(function() {
    'use strict';

    angular.module('tagcade.reports.performanceReport')
        .factory('ReportParams', ReportParams)
    ;

    function ReportParams(_, DateFormatter) {
        var api = {
            transformData: transformData,
            getStateParams: getStateParams
        };

        return api;

        /////

        /**
         *
         * @param {Object} params
         * @returns {Object}
         */
        function _filterBlankParamValues(params) {
            return _.omit(params, function(value) {
                return !_.identity(value);
            });
        }

        function transformData(data) {
            if (!_.isObject(data)) {
                return data;
            }

            if (data.startDate) {
                data.startDate = DateFormatter.getDate(data.startDate);
            }

            if (data.endDate) {
                data.endDate = DateFormatter.getDate(data.endDate);
            }

            return data;
        }

        function convertToDateTime(date) {
            date = DateFormatter.getDate(date);

            if (!date) {
                return false;
            }

            return date.toDate(); // convert moment to js date
        }

        /**
         *
         * @param {Object} unfilteredParams
         * @returns {Object|Boolean}
         */
        function getStateParams(unfilteredParams) {
            if (!_.isObject(unfilteredParams)) {
                return false;
            }

            var params = {
                startDate: null,
                endDate: null
            };

            if (_.isObject(unfilteredParams.date)) {
                _.extend(
                    params,
                    _.pick(unfilteredParams.date, ['startDate', 'endDate'])
                );
            }

            _.extend(
                params,
                _.omit(unfilteredParams, ['date'])
            );

            params.startDate = convertToDateTime(params.startDate) || null;

            if (params.endDate) {
                params.endDate = convertToDateTime(params.endDate) || null;
            }

            return _filterBlankParamValues(params);
        }
    }
})();