(function () {
    'use strict';

    angular.module('tagcade.core.util')
        .factory('NewDashboardUtil', NewDashboardUtil)
    ;

    function NewDashboardUtil(DASHBOARD_TYPE_JSON, DateFormatter, $translate) {
        const LABELS = {
            'impressions': 'Impression',
            'adTagRequests': 'Requests',
            'estDemandRevenue': 'Revenue',
            'estRevenue': 'Revenue',
            'requestFillRate': 'Fill Rate',
            'fillRate': 'Fill Rate',
            'bids': 'Bids',
            'errors': 'Errors',
            'requests': 'Requests',
            'billedAmount': 'Billed Amount',
            'blocks': 'Blocked Requests',
            'slotOpportunities': 'Slot Opps'
        };

        return {
            getShowLabel: getShowLabel,
            getRandomColor: getRandomColor,
            isVideoDashboard: isVideoDashboard,
            isDisplayDashboard: isDisplayDashboard,
            isUnifiedDashboard: isUnifiedDashboard,
            getStringDate: getStringDate,
            removeNonDigit: removeNonDigit,
            isDifferentDate: isDifferentDate,
            getTodayDateRange: getTodayDateRange,
            getWeekDateRange: getWeekDateRange,
            getMonthDateRange: getMonthDateRange,
            getYearDateRange: getYearDateRange,
            getCompareLabel: getCompareLabel
        };
        function getCompareLabel(mode) {
            if (mode === 'day') {
                return $translate.instant('NEW_DASHBOARD.DAY_LABEL');
            }
            if (mode === 'week') {
                return $translate.instant('NEW_DASHBOARD.WEEK_LABEL');
            }
            if (mode === 'month') {
                return $translate.instant('NEW_DASHBOARD.MONTH_LABEL');
            }
            if (mode === 'year') {
                return $translate.instant('NEW_DASHBOARD.YEAR_LABEL');
            }
            if (mode === 'custom') {
                return '';
            }
            if(mode === 'yesterday'){
                return $translate.instant('NEW_DASHBOARD.YESTERDAY');
            }
            return '';
        }

        function getTodayDateRange() {
            return [moment().startOf('day'), moment().endOf('day')];
        }

        function getWeekDateRange() {
            return [moment().subtract(6, 'days'), moment().subtract(0, 'days')];
        }

        function getMonthDateRange() {
            return [moment().subtract(29, 'days'), moment().subtract(0, 'days')];
        }

        function getYearDateRange() {
            return [moment().startOf('year'), moment().endOf('year')];
        }

        function isDifferentDate(newValue, oldValue) {
            var newDate = getStringDate(newValue) || newValue;
            var oldDate = getStringDate(oldValue) || oldValue;
            if (!newDate || !newDate.startDate || !newDate.endDate || !oldDate || !oldDate.startDate || !oldDate.endDate) {
                return (newDate != oldDate);
            }

            /* If date range value not change. Do not call api */
            return (newDate.startDate !== oldDate.startDate || newDate.endDate !== oldDate.endDate);
        }

        function removeNonDigit(inputString) {
            if (!inputString) return 0;
            var stringValue = inputString + '';
            return stringValue.replace(/[^0-9-.]/g, '');
        }

        function getStringDate(dateRange) {
            var startDate = dateRange == null ? null : dateRange.startDate;
            var endDate = dateRange == null ? null : dateRange.endDate;
            if (!startDate || (startDate._isValid && startDate._isValid === false)) {
                return null;
            }
            if (!endDate || (endDate._isValid && endDate._isValid === false)) {
                return null;
            }
            var selectedStartDate = DateFormatter.getFormattedDate(startDate);
            var selectedEndDate = DateFormatter.getFormattedDate(endDate);
            var selectedDate;
            selectedDate = {
                startDate: selectedStartDate,
                endDate: selectedEndDate
            };
            return selectedDate;
        }

        function getRandomColor() {
            var letters = '0123456789ABCDEF';
            var color = '#';
            for (var i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        }

        function getShowLabel(field) {
            if (!LABELS || !LABELS[field]) {
                return field;
            }
            return LABELS[field];
        }

        function isVideoDashboard(type) {
            if (!type || !type.name) {
                return false;
            }

            return DASHBOARD_TYPE_JSON['VIDEO'] === type.name;
        }

        function isDisplayDashboard(type) {
            if (!type || !type.name) {
                return false;
            }

            return DASHBOARD_TYPE_JSON['DISPLAY'] === type.name;
        }

        function isUnifiedDashboard(type) {
            if (!type || !type.name) {
                return false;
            }

            return DASHBOARD_TYPE_JSON['UNIFIED_REPORT'] === type.name;
        }
    }
})();