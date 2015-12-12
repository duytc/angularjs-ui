(function() {
    'use strict';
    
    angular.module('tagcade.reports.unified')
        .factory('unifiedReport', unifiedReport)
    ;
    
    function unifiedReport($q, _, dateUtil, ReportParams, dataService, API_UNIFIED_REPORTS_BASE_URL) {
        var api = {
            getInitialParams: getInitialParams,
            resetParams: resetParams,

            getPulsePoint: getPulsePoint
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

        function getReport(url, params, additionalParams) {
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

            if(!params.page) {
                params.page = 1;
            }

            return dataService.makeHttpGetRequest(url, params, API_UNIFIED_REPORTS_BASE_URL)
                .catch(function() {
                    return false
                });
        }

        function getPulsePoint(params, additionalParams) {
            return getReport('/partners/:adNetwork', params, additionalParams);
        }
    }
})(angular);