angular.module('tagcade.reports.performanceReport')

    .factory('DateFormatter', function (REPORT_DATE_FORMAT) {
        'use strict';

        return {
            getDate: function(date) {
                if (moment.isMoment(date)) {
                    return date;
                }

                if (angular.isString(date)) {
                    date = moment(date, REPORT_DATE_FORMAT, true);

                    if (date.isValid()) {
                        return date;
                    }
                }

                if (date instanceof Date) {
                    return moment(date);
                }

                return false;
            },

            getFormattedDate: function (date) {
                date = this.getDate(date);

                if (date === false) {
                    return false;
                }

                return date.format(REPORT_DATE_FORMAT);
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
    })

;
