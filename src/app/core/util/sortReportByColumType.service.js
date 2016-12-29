(function () {
    'use strict';

    angular.module('tagcade.core.util')
        .factory('SortReportByColumnType', SortReportByColumnType);

    function SortReportByColumnType() {

        return {
            sortByColumnType: sortReportByColumnType,
            getDateFormat: getDateFormat
        }
    }

    var mappedDate = [
        {label: 'YYYY-MM-DD', key: 'Y-m-d'},  //yyyy-mm-dd
        {label: 'YYYY/MM/DD', key: 'Y/m/d'},  //yyyy/mm/dd
        {label: 'MM-DD-YYYY', key: 'm-d-Y'},  //mm-dd-yyyy
        {label: 'MM/DD/YYYY', key: 'm/d/Y'},  //mm/dd/yyyy
        {label: 'DD-MM-YYYY', key: 'd-m-Y'},  //DD-mm-yyyy
        {label: 'DD/MM/YYYY', key: 'd/m/Y'},  //DD/mm/yyyy
        {label: 'YYYY-MON-DD', key: 'Y-M-d'}, // 2016-Mar-01
        {label: 'YYYY/MON/DD', key: 'Y/M/d'}, // 2016/Mar/01
        {label: 'MM-MON-YYYY', key: 'M-d-Y'}, // Mar-01-2016
        {label: 'MM/MON/YYYY', key: 'M/d/Y'}, // Mar/01/2016
        {label: 'DD-MON-YYYY', key: 'd-M-Y'}, // 01-Mar-2016
        {label: 'DD/MON/YYYY', key: 'd/M/Y'}  // 01/Mar/2016
    ];

    function sortReportByColumnType(reports, typeOfKeyName, keyName, isReverse, dateFormat) {

        if (typeOfKeyName == 'number' || typeOfKeyName == 'decimal') {
            return sortReportsByNumberField(reports, keyName, isReverse);
        }

        if (typeOfKeyName == 'text') {
            return sortReportByTextField(reports, keyName, isReverse)
        }

        if (typeOfKeyName == 'date') {
            if (_.isNull(dateFormat)) {
                dateFormat = 'YYYY-MM-DD';
            }
            return sortReportByDateField(reports, keyName, isReverse, dateFormat)
        }
    }

    function sortReportsByNumberField(reports, keyName, isReverse) {
        if (!isReverse) {
            return reports.sort(function (a, b) {

                var aCopy = angular.copy(a[keyName]),
                    bCopy = angular.copy(b[keyName]);

                if (!_.isNull(aCopy) && !_.isNull(bCopy)) {
                    aCopy = aCopy.toString().replace(/[$]/g, '');
                    bCopy = bCopy.toString().replace(/[$]/g, '');

                    return aCopy - bCopy;
                }

                if (_.isNull(aCopy) && _.isNull(bCopy)) {
                    return 0;
                }

                if (_.isNull(aCopy)) {
                    return -1;
                }


                if (_.isNull(bCopy)) {
                    return 1
                }
            });
        }

        return reports.sort(function (a, b) {

            var aCopy = angular.copy(a[keyName]),
                bCopy = angular.copy(b[keyName]);

            if (!_.isNull(aCopy) && !_.isNull(bCopy)) {
                aCopy = aCopy.toString().replace(/[$]/g, '');
                bCopy = bCopy.toString().replace(/[$]/g, '');

                return bCopy - aCopy;
            }

            if (_.isNull(aCopy) && _.isNull(bCopy)) {
                return 0;
            }

            if (_.isNull(aCopy)) {
                return 1;
            }


            if (_.isNull(bCopy)) {
                return -1;
            }
        });
    }

    function sortReportByTextField(reports, keyName, isReverse) {
        if (!isReverse) {
            return reports.sort(function (a, b) {

                if (_.isNull(a[keyName]) && _.isNull(b[keyName])) {
                    return 0;
                }

                if (_.isNull(a[keyName])) {
                    return 1;
                }

                if (_.isNull(b[keyName])) {
                    return -1;
                }

                if (a[keyName] > b[keyName]) {
                    return 1
                }

                if (a[keyName] < b[keyName]) {
                    return -1
                }
                return 0;
            });
        }

        return reports.sort(function (a, b) {

            if (_.isNull(a[keyName]) && _.isNull(b[keyName])) {
                return 0;
            }

            if (_.isNull(a[keyName])) {
                return -1;
            }

            if (_.isNull(b[keyName])) {
                return 1;
            }

            if (a[keyName] < b[keyName]) {
                return 1
            }

            if (a[keyName] > b[keyName]) {
                return -1
            }
            return 0;
        });
    }

    function sortReportByDateField(reports, keyName, isReverse, dateFormat) {

        if (!isReverse) {
            return reports.sort(function (a, b) {

                if (!_.isNull(a[keyName]) && !_.isNull(b[keyName])) {
                    return (moment(a[keyName], dateFormat) - moment(b[keyName], dateFormat));
                }

                if (_.isNull(a[keyName]) && _.isNull(b[keyName])) {
                    return 0;
                }

                if (_.isNull(a[keyName])) {
                    return -1;
                }

                if (_.isNull(b[keyName])) {
                    return 1;
                }

            });
        }

        return reports.sort(function (a, b) {

            if (!_.isNull(a[keyName]) && !_.isNull(b[keyName])) {
                return (moment(b[keyName], dateFormat) - moment(a[keyName], dateFormat));
            }

            if (_.isNull(a[keyName]) && _.isNull(b[keyName])) {
                return 0;
            }

            if (_.isNull(a[keyName])) {
                return 1;
            }

            if (_.isNull(b[keyName])) {
                return -1;
            }
        });
    }

    function getDateFormat(formats) {
        var dateFormat = null;
        angular.forEach(formats, function (format) {
            if (format.type == 'date') {
                dateFormat = _.find(mappedDate, function (element) {
                    return (element.key == format.format);
                });
            }
        });
        dateFormat = dateFormat ? dateFormat.label : 'YYYY-MM-DD';

        return dateFormat;
    }


})();