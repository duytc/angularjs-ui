(function() {
    'use strict';

    angular.module('tagcade.reports.performance')
        .factory('ReportParams', ReportParams)
    ;

    function ReportParams(_, dateUtil) {
        var api = {
            transformData: transformData,
            getStateParams: getStateParams,
            getFormParams: getFormParams
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

        function _convertToDateTime(date) {
            date = dateUtil.getDate(date);

            if (!date) {
                return false;
            }

            return date.toDate(); // convert moment to js date
        }

        /**
         *
         * @param {Object} unfilteredParams
         * @param {Array} [additionalParams]
         * @returns {Object|Boolean}
         */
        function _filterParams(unfilteredParams, additionalParams) {
            if (!_.isObject(unfilteredParams)) {
                return false;
            }

            var params = {
                startDate: unfilteredParams.startDate || null,
                endDate: unfilteredParams.endDate || null
            };

            if (_.isObject(unfilteredParams.date)) {
                _.extend(
                    params,
                    _.pick(unfilteredParams.date, ['startDate', 'endDate'])
                );
            } else if (_.isString(unfilteredParams.date)) {
                params.startDate = unfilteredParams.date;
            }

            if (_.isObject(unfilteredParams.reportType)) {
                _.extend(
                    params,
                    unfilteredParams.reportType
                );
            }

            var remainingParams = _.omit(unfilteredParams, function(value, key) {
                return _.has(params, key) || key == 'date';
            });

            if (_.isArray(additionalParams)) {
                remainingParams = _.pick(remainingParams, additionalParams);
            }

            _.extend(
                params,
                remainingParams
            );

            params.startDate = dateUtil.getDate(params.startDate) || null;
            params.endDate = dateUtil.getDate(params.endDate) || null;

            return _filterBlankParamValues(params);
        }

        function transformData(data) {
            if (!_.isObject(data)) {
                return data;
            }

            if (data.startDate) {
                data.startDate = dateUtil.getDate(data.startDate);
            }

            if (data.endDate) {
                data.endDate = dateUtil.getDate(data.endDate);
            }

            return data;
        }

        /**
         *
         * @param {Object} unfilteredParams
         * @param {Array} [additionalParams]
         * @returns {Object|Boolean}
         */
        function getStateParams(unfilteredParams, additionalParams) {
            var params = _filterParams(unfilteredParams, additionalParams);

            if (!params) {
                return false;
            }

            params.startDate = _convertToDateTime(params.startDate);
            params.endDate = _convertToDateTime(params.endDate) || null;
            params.uniqueRequestCacheBuster = Math.random();

            return params;
        }

        /**
         *
         * @param {Object} unfilteredParams
         * @param {Array} [additionalParams]
         * @returns {Object|Boolean}
         */
        function getFormParams(unfilteredParams, additionalParams) {
            var params = _filterParams(unfilteredParams, additionalParams);

            if (!params) {
                return false;
            }

            params.date = {
                startDate: params.startDate,
                endDate: params.endDate
            };

            return _.omit(params, ['startDate', 'endDate', 'uniqueRequestCacheBuster']);
        }
    }
})();