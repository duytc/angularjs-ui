(function() {
    'use strict';

    angular.module('tagcade.unifiedReport.report')
        .factory('unifiedReportFormatReport', unifiedReportFormatReport)
    ;

    function unifiedReportFormatReport() {
        var api = {
            formatReports: formatReports
        };

        var mappedDate = [
            {label: 'YYYY-MM-DD', key: 'Y-m-d',  formatForJs: 'YYYY-MM-DD'},  //yyyy-mm-dd
            {label: 'YYYY/MM/DD', key: 'Y/m/d' , formatForJs: 'YYYY/MM/DD'},  //yyyy/mm/dd
            {label: 'MM-DD-YYYY', key: 'm-d-Y' , formatForJs: 'MM-DD-YYYY'},  //mm-dd-yyyy
            {label: 'MM/DD/YYYY', key: 'm/d/Y' , formatForJs: 'MM/DD/YYYY'},  //mm/dd/yyyy
            {label: 'DD-MM-YYYY', key: 'd-m-Y' , formatForJs: 'DD-MM-YYYY'},  //DD-mm-yyyy
            {label: 'DD/MM/YYYY', key: 'd/m/Y' , formatForJs: 'DD/MM/YYYY'},  //DD/mm/yyyy
            {label: 'YYYY-MMM-DD', key: 'Y-M-d', formatForJs: 'YYYY-MMM-DD'}, // 2016-Mar-01
            {label: 'YYYY/MMM/DD', key: 'Y/M/d', formatForJs: 'YYYY/MMM/DD'}, // 2016/Mar/01
            {label: 'MMM-DD-YYYY', key: 'M-d-Y', formatForJs: 'MMM-DD-YYYY'}, // Mar-01-2016
            {label: 'MMM/DD/YYYY', key: 'M/d/Y', formatForJs: 'MMM/DD/YYYY'}, // Mar/01/2016
            {label: 'DD-MMM-YYYY', key: 'd-M-Y', formatForJs: 'DD-MMM-YYYY'}, // 01-Mar-2016
            {label: 'DD/MMM/YYYY', key: 'd/M/Y', formatForJs: 'DD/MMM/YYYY'},  // 01/Mar/2016
            {label: 'MMM DD, YYYY', key: 'M d, Y', formatForJs: 'MMM DD, YYYY'},  // Jan 15, 2016
            {label: 'YYYY, MMM DD', key: 'Y, M d', formatForJs: 'YYYY, MMM DD'}, //2016, Jan 15

            /** Support 2 digit years*/
            {label: 'MM/DD/YY', key: 'm/d/y', formatForJs:'MM/DD/YY'},   //01/15/99
            {label: 'MM-DD-YY', key: 'm-d-y', formatForJs:'MM-DD-YY'},   //01-15-99
            {label: 'DD/MM/YY', key: 'd/m/y', formatForJs:'DD/MM/YY'},   //15/01/99
            {label: 'DD-MM-YY', key: 'd-m-y', formatForJs:'DD-MM-YY'},   //15-01-99
            {label: 'YY/MM/DD', key: 'y/m/d', formatForJs:'YY/MM/DD'},   //99/01/15
            {label: 'YY-MM-DD', key: 'y-m-d', formatForJs:'YY-MM-DD'},   //99-01-15,

            /** Support datetime format, include hour, month, second */
            {label: 'YYYY-MM-DD HH:mm:ss', key: 'Y-m-d H:i:s',  formatForJs: 'YYYY-MM-DD HH:mm:ss'},
            {label: 'YYYY-MM-DD HH:mm', key: 'Y-m-d H:i',  formatForJs: 'YYYY-MM-DD HH:mm'}  
        ];

        return api;

        function formatReports(reports, reportView) {
            var tempReports = angular.copy(reports);
            angular.forEach(tempReports, function (report, key) {
                report.position = key; // position is index of report item root

                angular.forEach(report, function (value, key) {
                    // value = value == null ? '' : value;

                    if(reportView.fieldTypes[key] == 'number' || reportView.fieldTypes[key] == 'decimal') {
                        value = (value == null || value == undefined) ? '-1' : value;
                    }

                    if(!angular.isString(value)) {
                        return;
                    }

                    if(reportView.fieldTypes[key] == 'number' || reportView.fieldTypes[key] == 'decimal') {
                        value = value.replace(/[.,$ ]/g, '');
                        report[key] = !!parseFloat(value) ? parseFloat(value) : 0;
                    }

                    if(!value) {
                        return
                    }

                    if (reportView.fieldTypes[key] == 'date') {
                        var dateFormat = getDateFormat(reportView);

                        report[key] = moment(value, dateFormat).format('YYYY-MM-DD'); //DateFormatter.getFormattedDate(value, dateFormat);
                    }
                });
            });

            return tempReports;
        }

        function getDateFormat(reportView) {
            var dateFormat = null;
            angular.forEach(reportView.formats, function (format) {
                if (format.type == 'date') {
                    dateFormat = _.find(mappedDate, function (element) {
                        return (element.key == format.format);
                    });
                }
            });
            dateFormat = dateFormat ? dateFormat.formatForJs : 'YYYY-MM-DD';

            return dateFormat;
        }
    }
})(angular);