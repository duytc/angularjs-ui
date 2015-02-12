(function() {
    'use strict';

    angular.module('tagcade.supportTools.activityLog')
        .factory('activityLogs', activityLogs)
    ;

    function activityLogs(adminRestangular, DateFormatter, ROW_LIMIT) {
        var api = {
            getInitialShowLoginLogs: getInitialShowLoginLogs,
            setInitialShowLoginLogs: setInitialShowLoginLogs,

            getInitialParams: getInitialParams,

            getLogs: getLogs
        };

        var _$initialShowLoginLogs = null;
        var _$initialParams = null;

        return api;

        /////

        function getInitialShowLoginLogs() {
            return _$initialShowLoginLogs
        }

        function setInitialShowLoginLogs(showLoginLogs) {
            _$initialShowLoginLogs = showLoginLogs
        }

        function getInitialParams() {
            return _$initialParams;
        }

        function getLogs(params) {
            if(!params.rowOffset || params.rowOffset < 0) {
                params.rowOffset = 0;
            }

            if(!params.rowLimit) {
                params.rowLimit = ROW_LIMIT;
            }

            params.loginLogs =  (!params.loginLogs || params.loginLogs != 'true') ? false : true;

            if(!params.startDate) {
                params.startDate = DateFormatter.getFormattedDate(moment().subtract(6, 'days'));
                params.endDate = DateFormatter.getFormattedDate(moment().startOf('day'));
            }

            _$initialParams = angular.copy(params);

            return adminRestangular.one('logs').get(params);
        }
    }
})(angular);