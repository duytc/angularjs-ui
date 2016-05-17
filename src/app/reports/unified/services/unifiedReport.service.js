(function() {
    'use strict';
    
    angular.module('tagcade.reports.unified')
        .factory('unifiedReport', unifiedReport)
    ;
    
    function unifiedReport($q, _, dateUtil, ReportParams, dataService, API_UNIFIED_REPORTS_BASE_URL, API_PERFORMANCE_REPORTS_BASE_URL) {
        var api = {
            getInitialParams: getInitialParams,
            resetParams: resetParams,

            getPulsePoint: getPulsePoint,
            getPulsePointDiscrepancies: getPulsePointDiscrepancies,
            getAdNetworkReport: getAdNetworkReport
        };

        var _$initialParams = null;

        return api;

        /**
         *
         * @returns {object}
         */
        function getInitialParams() {
            if (!_$initialParams) {
                return {};
            }

            return angular.copy(_$initialParams);
        }

        function resetParams() {
            _$initialParams = null;
        }

        /**
         *
         * @param {object} params
         * @param {object} [additionalParams]
         * @returns {object|bool}
         */
        function processInitialParams(params, additionalParams) {
            params = angular.copy(params);

            if (!_.isObject(params)) {
                return false;
            }

            angular.extend(params, additionalParams);

            if (!params.startDate) {
                return false;
            }

            params = ReportParams.transformData(params);

            _$initialParams = angular.copy(params);

            return params;
        }

        function getReport(url, params, additionalParams, API_REPORT) {
            if (!params) {
                params = {};
            }

            // set _$initialParams
            params = processInitialParams(params, additionalParams);

            params = angular.copy(params);

            params.startDate = dateUtil.getFormattedDate(params.startDate);

            if (!params.startDate) {
                return $q.reject(new Error('cannot get report, missing start date'));
            }

            params.endDate = dateUtil.getFormattedDate(params.endDate);
            params.group = true;

            var apiReport = !API_REPORT ? API_UNIFIED_REPORTS_BASE_URL : API_REPORT;

            return dataService.makeHttpGetRequest(url, params, apiReport)
                .catch(function() {
                    return false
                });
        }

        function getPulsePoint(params, additionalParams) {
            if (params.startDate == null) {
                params.startDate = moment().subtract(6, 'days').startOf('day').toDate();
                params.endDate = moment().subtract(1, 'days').startOf('day').toDate();
            }

            var url = _getUrl(params, additionalParams, '');

            return getReport(url, params, additionalParams);
        }

        function getPulsePointDiscrepancies(params, additionalParams) {
            var url = _getUrl(params, additionalParams, '/comparison');

            return getReport(url, params, additionalParams);
        }

        function getAdNetworkReport(params, additionalParams) {
            var url = _getUrl(params, additionalParams, '');

            return getReport(url, params, additionalParams, API_PERFORMANCE_REPORTS_BASE_URL);
        }

        function _getUrl(params, additionalParams, prefix) {
            var breakDown = angular.isObject(additionalParams) ? additionalParams.breakDown : params.breakDown;

            if(!params.adNetwork) {
                params.adNetwork = 'all';
            }

            if(params.adNetwork == 'all') {
                if(breakDown == 'day') {
                    return prefix+'/accounts/:publisher/partners'; //get all ad network
                }

                return prefix+'/accounts/:publisher/partners/:adNetwork/:breakDown'; // get all ad network
            }

            if(breakDown == 'day') {
                return !!params.site ? prefix+'/accounts/:publisher/partners/:adNetwork/sites/:site' : prefix+'/accounts/:publisher/partners/:adNetwork/sites';
            }

            return !!params.site ? prefix+'/accounts/:publisher/partners/:adNetwork/sites/:site/:breakDown' : prefix+'/accounts/:publisher/partners/:adNetwork/sites/all/:breakDown';
        }
    }
})(angular);