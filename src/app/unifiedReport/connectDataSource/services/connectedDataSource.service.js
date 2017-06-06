(function() {
    'use strict';
    
    angular.module('tagcade.unifiedReport.connect')
        .factory('connectedDataSourceService', connectedDataSourceService)
    ;

    function connectedDataSourceService() {
        var api = {
            inputFormatFieldDataSet: inputFormatFieldDataSet,
            inputFormatDataSourceField: inputFormatDataSourceField,
            inputFormatTemporaryFields: inputFormatTemporaryFields,

            findField: findField
        };

        return api;
        
        function findField(field) {
            if(!field) {
                return undefined
            }

            if(field.indexOf('__$$FILE$$') == 0) {
                var keyField = field.slice('__$$FILE$$'.length, field.length);

                return {
                    key: field,
                    label: 'File: ' + keyField,
                    original: keyField
                }
            }

            if(field.indexOf('__$$TEMP$$') == 0) {
                var keyTemp = field.slice('__$$TEMP$$'.length, field.length);

                return {
                    key: field,
                    label: 'Temp: ' + keyTemp,
                    original: keyTemp
                }
            }

            if(field.indexOf('__$$FILE$$') == -1 && field.indexOf('__$$TEMP$$') == -1) {
                return {
                    key: field,
                    label: field,
                    original: field
                }
            }
        }

        function inputFormatFieldDataSet(fields) {
            var temps = [];

           angular.forEach(fields, function (field) {
               temps.push({
                   key: field,
                   label: field,
                   original: field
               })
           });

            return temps
        }

        function inputFormatDataSourceField(fields) {
            var temps = [];

            angular.forEach(fields, function (field) {
                temps.push({
                    key: '__$$FILE$$' + field,
                    label: 'File: ' + field,
                    original: field
                })
            });

            return temps
        }

        function inputFormatTemporaryFields(fields) {
            var temps = [];

            angular.forEach(fields, function (field) {
                temps.push({
                    key: '__$$TEMP$$' + field,
                    label: 'Temp: ' + field,
                    original: field
                })
            });

            return temps
        }
    }
})(angular);