(function() {
    'use strict';

    angular.module('tagcade.core.util')
        .factory('DateFormatter', DateFormatter)
    ;

    function DateFormatter(REPORT_DATE_FORMAT) {
        return {
            getDate: function(date) {
                if (moment.isMoment(date)) {
                    return date;
                }

                if (date instanceof Date) {
                    return moment(date);
                }

                if (angular.isString(date)) {
                    date = moment(date, REPORT_DATE_FORMAT, true);

                    if (date.isValid()) {
                        return date;
                    }
                }

                return false;
            },

            getFormattedDate: function (date, format) {
                date = this.getDate(date);

                if (date === false) {
                    return null;
                }

                format = format || REPORT_DATE_FORMAT;

                return date.format(format);
            },

            isValidDate: function (date) {
                return moment.isMoment(date) && date.isValid();
            },

            isValidDateRange: function (startDate, endDate) {
                startDate = this.getDate(startDate);
                endDate = this.getDate(endDate);

                if (!this.isValidDate(startDate) || !this.isValidDate(endDate)) {
                    return false;
                }

                return startDate.isBefore(endDate) || startDate.isSame(endDate);
            }
        };
    }
})();