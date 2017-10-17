(function() {
    'use strict';
    
    angular.module('tagcade.unifiedReport.report')
        .factory('getDateReportView', getDateReportView)
    ;

    function getDateReportView() {
        var api = {
            getMinStartDateInFilterReportView: getMinStartDateInFilterReportView,
            getMaxEndDateInFilterReportView: getMaxEndDateInFilterReportView
        };

        var dateRangeForDynamic = {
            'today': {startDate: moment().startOf('day'), endDate: moment().endOf('day')},
            'yesterday': {startDate: moment().subtract(1, 'days'), endDate: moment().subtract(1, 'days')},
            'last 7 days': {startDate: moment().subtract(7, 'days'), endDate: moment().subtract(1, 'days')},
            'last 30 days': {startDate: moment().subtract(30, 'days'), endDate: moment().subtract(1, 'days')},
            'this month': {startDate: moment().startOf('month'), endDate: moment().endOf('month')},
            'last month': {startDate: moment().subtract(1, 'month').startOf('month'), endDate: moment().subtract(1, 'month').endOf('month')}
        };

        return api;
        
        function getMinStartDateInFilterReportView(item) {
            var reportView = angular.copy(item);
            var minStartDate = null;

            angular.forEach(reportView.filters, function (filter) {
                if(filter.type == 'date' || filter.type == 'datetime') {
                    if(filter.dateType == 'dynamic' && !angular.isObject(filter.dateValue)) {
                        filter.dateValue = _getDateByDynamicKey(filter.dateValue);
                    }

                    if(!minStartDate || (new Date(filter.dateValue.startDate).getTime() < new Date(minStartDate).getTime())) {
                        minStartDate = filter.dateValue.startDate;
                    }
                }
            });

            angular.forEach(reportView.reportViewDataSets, function (item) {
                angular.forEach(item.filters, function (filter) {
                    if(filter.type == 'date' || filter.type == 'datetime') {
                        if(filter.dateType == 'dynamic' && !angular.isObject(filter.dateValue)) {
                            filter.dateValue = _getDateByDynamicKey(filter.dateValue);
                        }

                        if(!minStartDate || (new Date(filter.dateValue.startDate).getTime() < new Date(minStartDate).getTime())) {
                            minStartDate = filter.dateValue.startDate;
                        }
                    }
                });
            });

            return minStartDate;
        }
        
        function getMaxEndDateInFilterReportView(item) {
            var reportView = angular.copy(item);
            var maxEndDate = null;

            angular.forEach(reportView.filters, function (filter) {
                if(filter.type == 'date' || filter.type == 'datetime') {
                    if(filter.dateType == 'dynamic' && !angular.isObject(filter.dateValue)) {
                        filter.dateValue = _getDateByDynamicKey(filter.dateValue);
                    }

                    if(!maxEndDate || (new Date(filter.dateValue.endDate).getTime() > new Date(maxEndDate).getTime())) {
                        maxEndDate = filter.dateValue.endDate;
                    }
                }
            });

            angular.forEach(angular.copy(reportView.reportViewDataSets), function (item) {
                angular.forEach(item.filters, function (filter) {
                    if(filter.type == 'date' || filter.type == 'datetime') {
                        if(filter.dateType == 'dynamic' && !angular.isObject(filter.dateValue)) {
                            filter.dateValue = _getDateByDynamicKey(filter.dateValue);
                        }

                        if(!maxEndDate || (new Date(filter.dateValue.endDate).getTime() > new Date(maxEndDate).getTime())) {
                            maxEndDate = filter.dateValue.endDate;
                        }
                    }
                });
            });

            return maxEndDate;
        }
        
        function _getDateByDynamicKey(dynamicKey) {
            if(angular.isObject(dateRangeForDynamic[dynamicKey])) {
                return dateRangeForDynamic[dynamicKey]
            }

            return {startDate: null, endDate: null}
        }
    }
})(angular);