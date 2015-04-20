(function() {
    'use strict';

    angular.module('tagcade.blocks.export')
        .factory('exportExcelService', exportExcelService)
    ;

    function exportExcelService($filter) {
        var exportDate = {
            exportExcel : exportExcel
        };

        return exportDate;

        /**
         *
         * @param data
         * @param header
         * @param fileName
         * @returns {*}
         */
        function exportExcel(data, fields, header, fileName) {
            var data = angular.copy(data);
            var bodyData = _bodyData(data, fields);
            var strData = _convertToExcel(header, bodyData);

            var blob = new Blob([strData], {type: "text/plain;charset=utf-8"});

            return saveAs(blob, [fileName+'.csv']);
        }

        function _convertToExcel(header, body) {
            return header + '\n' + body;
        }

        function _bodyData(data, fields) {
            var body = "";
            angular.forEach(data, function(dataItem) {
                dataItem.date = '"' + $filter('date')(dataItem.date, 'longDate') + '"';
                dataItem.startDate = '"' + $filter('date')(dataItem.startDate, 'longDate') + '"';
                dataItem.endDate = '"' + $filter('date')(dataItem.endDate, 'longDate') + '"';

                var rowItems = [];

                angular.forEach(fields, function(field) {
                    if(field.indexOf('.')) {
                        field = field.split(".");
                        var curItem = dataItem;

                        // deep access to obect property
                        angular.forEach(field, function(prop){
                            if (curItem != null && curItem != undefined) {
                                curItem = curItem[prop]
                            }
                        });

                        data = curItem;
                    }
                    else {
                        data = dataItem[field];
                    }

                    var fieldValue = data != null ? data : ' ';

                    if (fieldValue != undefined && angular.isObject(fieldValue)) {
                        fieldValue = _objectToString(fieldValue);
                    }

                    rowItems.push(fieldValue);
                });

                body += rowItems.toString() + '\n';
            });

            return body;
        }

        function _objectToString(object) {
            var output = '';
            angular.forEach(object, function(value, key) {
                output += key + ':' + value + ' ';
            });

            return '"' + output + '"';
        }
    }
})();