angular.module('tagcade.reports.performanceReport')
    /**
     * Service used by both report fetcher and selector form
     */
    .factory('ReportParams', function(_, PERFORMANCE_REPORT_TYPES, DateFormatter) {
        var api = {};

        /**
         *
         * @param {String} reportType
         * @returns {Object|Boolean}
         */
        function getReportType(reportType) {
            var temp = reportType.split('.');

            if (!temp.length) {
                return false;
            }

            var value = PERFORMANCE_REPORT_TYPES;

            while (temp.length) {
                var prop = temp.shift();

                value = value[prop];

                if (!value) {
                    return false;
                }
            }

            if (!_.isObject(value)) {
                return false;
            }

            return value;
        }

        /**
         *
         * @param {Object} params
         * @returns {Object}
         */
        function filterBlankParamValues(params) {
            return _.omit(params, function(value) {
                return !_.identity(value);
            });
        }

        /**
         *
         * @param {Object} unfilteredParams
         * @param {Object} reportType
         * @returns {Object|Boolean}
         */
        function getRequiredParamsForReportType(unfilteredParams, reportType) {
            if (!_.isObject(reportType)) {
                return false;
            }

            if (!_.isArray(reportType.requiredParams)) {
                return {};
            }

            return filterBlankParamValues(_.pick(unfilteredParams, reportType.requiredParams));
        }

        api.getReportType = getReportType;

        /**
         * @param {Object} unfilteredParams
         * @param {String} [reportTypeKey]
         * @returns {Object|Boolean}
         */
        api.getOnlyRequiredParamsForReportType = function (unfilteredParams, reportTypeKey) {
            if (!_.isObject(unfilteredParams)) {
                return false;
            }

            reportTypeKey = reportTypeKey || unfilteredParams.reportType;

            var reportType = getReportType(reportTypeKey);

            if (!reportType) {
                return false;
            }

            return getRequiredParamsForReportType(unfilteredParams, reportType);
        };

        /**
         *
         * @param {Object} unfilteredParams
         * @param {String} [reportTypeKey]
         * @returns {Object|Boolean}
         */
        api.getParamsForReportType = function (unfilteredParams, reportTypeKey) {
            if (!_.isObject(unfilteredParams)) {
                return false;
            }

            reportTypeKey = reportTypeKey || unfilteredParams.reportType;

            var reportType = getReportType(reportTypeKey);

            if (!reportType) {
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
                _.pick(unfilteredParams, ['startDate', 'endDate', 'expand'])
            );

            if (params.startDate) {
                params.startDate = DateFormatter.getFormattedDate(params.startDate) || null;
            }

            if (params.endDate) {
                params.endDate = DateFormatter.getFormattedDate(params.endDate) || null;
            }

            var requiredParams = getRequiredParamsForReportType(unfilteredParams, reportType);

            if (requiredParams) {
                _.extend(params, requiredParams);
            }

            return filterBlankParamValues(params);
        };

        return api;
    })

;