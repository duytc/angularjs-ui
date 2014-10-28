angular.module('tagcade.reports.performanceReport')

    .factory('ReportSelector', function($q, _, ReportsRestangular, DateFormatter) {
        var api = {};

        var _reportTypes = {};

        _reportTypes.platform = {
            platform: {
                routeParams: {
                    platform: null
                }
            },

            account: {
                requiredParams: ['publisherId'],
                routeParams: {
                    account: 'publisherId'
                }
            },

            site: {
                requiredParams: ['siteId'],
                routeParams: {
                    site: 'siteId'
                }
            },

            adSlot: {
                requiredParams: ['adSlotId'],
                routeParams: {
                    adslot: 'adSlotId'
                }
            },

            adTag: {
                requiredParams: ['adTagId'],
                routeParams: {
                    adtag: 'adTagId'
                },
                isExpandable: false
            }
        };

        _reportTypes.adNetwork = {
            adNetwork: {
                requiredParams: ['adNetworkId'],
                routeParams: {
                    adnetwork: 'adNetworkId'
                }
            },

            site: {
                requiredParams: ['adNetworkId', 'siteId'],
                routeParams: {
                    adnetwork: 'adNetworkId',
                    site: 'siteId'
                }
            }
        };

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

            var value = _reportTypes;

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

            var reportType = getReportType(reportTypeKey);

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

            if (!_.isArray(reportType.requiredParams)) {
                return {};
            }

            return _.pick(unfilteredParams, reportType.requiredParams)
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
                endDate: null,
                expand: unfilteredParams.expand || null
            };

            if (_.isObject(unfilteredParams.date)) {
                _.extend(
                    params,
                    _.pick(unfilteredParams.date, ['startDate', 'endDate'])
                );
            }

            _.extend(
                params,
                _.pick(unfilteredParams, ['expand', 'startDate', 'endDate'])
            );

            if (params.startDate) {
                params.startDate = DateFormatter.getFormattedDate(params.startDate) || null;
            }

            if (params.endDate) {
                params.endDate = DateFormatter.getFormattedDate(params.endDate) || null;
            }

            if (_.isArray(reportType.requiredParams)) {
                _.extend(
                    params,
                    _.pick(unfilteredParams, reportType.requiredParams)
                )
            }

            return params;
        };

        return api;
    })

;