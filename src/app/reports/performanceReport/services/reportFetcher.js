angular.module('tagcade.reports.performanceReport')
    /**
     * Fetches reports from the server
     */
    .factory('ReportFetcher', function($q, _, ReportsRestangular, ReportParams) {
        var api = {};

        /**
         * Checks that an object contains a value for every key specified
         *
         * @param {Object} params
         * @param {Array} requiredParams
         * @returns {boolean}
         */
        function paramsAreSet(params, requiredParams) {
            return _.every(_.pick(params, requiredParams), _.identity);
        }

        function getQueryParams(params, isExpandable) {
            var queryParams = ['startDate', 'endDate'];

            if (isExpandable !== false) {
                // add for all except ones that are explicitly false
                queryParams.push('expand');
            }

            return _.pick(params, queryParams)
        }

        /**
         *
         * @param {String} reportTypeKey
         * @param {Object} params
         * @returns {Promise}
         */
        api.getReports = function(reportTypeKey, params)
        {
            params = angular.copy(params);

            var reportType = ReportParams.getReportType(reportTypeKey);

            if (!reportType) {
                return $q.reject('report type does not exist');
            }

            if (reportType.requiredParams && !paramsAreSet(params, reportType.requiredParams)) {
                return $q.reject('required parameters are missing');
            }

            var rest = ReportsRestangular.all('performancereports');

            _.forEach(reportType.routeParams, function (queryParam, routeParam) {
                if (params[queryParam] === null) {
                    // if query param is null we just add the route param
                    rest = rest.one(routeParam);

                    return;
                }

                // add to restangular as an element
                rest = rest.one(routeParam, params[queryParam]);

                // remove it so it is not sent to the server as a query param
                delete params[queryParam];
            });

            return rest
                .getList('reports', getQueryParams(params, reportType.isExpandable))
                .then(function (reports) {
                    return _.flatten(reports.plain(), true);
                })
            ;
        };

        return api;
    })

;