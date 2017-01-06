(function () {
    'use strict';

    angular.module('tagcade.core.util')
        .factory('SortReportByColumnType', SortReportByColumnType);

    function SortReportByColumnType() {

        return {
            changeColumnName: changeColumnName
        }
    }

    function changeColumnName(columns) {

        var dataSetName = null,
            regexGetDataSetName = /\(([^)]+)\)/,
            dataSetNames = [];

        _.each(columns, function (value, key) {
            dataSetName = columns[key].match(regexGetDataSetName);
            if (_.isNull(dataSetName)) {
                return;
            }

            if (!_.contains(dataSetNames, dataSetName[0])) {
                dataSetNames.push(dataSetName[0]);
            }
        });

        if (dataSetNames.length >= 2 || !columns) {
            return columns;
        }

        // Remove data set name in title of column
        Object.keys(columns).map(function (key) {
            dataSetName = columns[key].match(regexGetDataSetName);
            if (_.isNull(dataSetName)) {
                return columns[key];
            }
            return columns[key] = columns[key].replace(dataSetName[0], "");
        });

        return columns;
    }

})();