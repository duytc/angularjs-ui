(function () {
    'use strict';

    angular.module('tagcade.core.util')
        .factory('OptimizationUtil', OptimizationUtil)
    ;

    function OptimizationUtil() {
        const ASC = "asc";
        const DESC = "desc";
        const NONE = null;
        return {
            getSpecialTransformType: getSpecialTransformType,
            isAdditionalField: isAdditionalField,
            isInTransFormChangeField: isInTransFormChangeField,
            isJoinField: isJoinField,
            customFieldName: customFieldName,
            concatFieldAndDataSet: concatFieldAndDataSet,
            removeDataSetId: removeDataSetId,
            extractDataSetId: extractDataSetId,
            getDataSetNameById: getDataSetNameById,
            compareValues: compareValues,
            toggleSort: toggleSort,
            buildFieldsName: buildFieldsName
        };

        function getSpecialTransformType() {
            return [
                'addField',
                'addCalculatedField',
                'addConditionValue',
                'comparisonPercent'
            ];
        }

        function buildFieldsName(reportView) {
            var nameData = [];
            var reportViewDataSets = reportView.reportViewDataSets;
            if (!reportViewDataSets) {
                return;
            }

            angular.forEach(reportViewDataSets, function (reportViewDataSet) {
                var dataSet = reportViewDataSet.dataSet;
                var dimensions = Object.keys(dataSet.dimensions);
                var metrics = Object.keys(dataSet.metrics);

                angular.forEach(dimensions.concat(metrics), function (dimension) {
                    nameData[dimension + '_' + dataSet.id] = dimension + ' (' + dataSet.name + ')';
                });
            });

            return nameData;
        }

        /**
         * return data set's name base on id
         * @param dataSetId
         * @param dataSetList
         * @returns {string}
         */
        function getDataSetNameById(dataSetId, dataSetList) {
            var found = dataSetList.find(function (item) {
                return item.dataSet.id == dataSetId;
            });
            return found.dataSet.name || '';
        }

        function isInTransFormChangeField(transformType) {
            var found = getSpecialTransformType().find(function (type) {
                return type === transformType;
            });
            return !!found;
        }

        /**
         *  return true if field is created in transform
         * @param fieldName
         * @param reportView
         * @returns {boolean}
         */
        function isAdditionalField(fieldName, reportView) {
            if (!reportView) return true;
            var isExist = false;
            angular.forEach(reportView.transforms, function (transform) {
                if (isInTransFormChangeField(transform.type)) {
                    var fields = transform.fields;
                    var found = fields.find(function (field) {
                        return field.field = fieldName;
                    });
                    if (found) {
                        isExist = true;
                    }
                }
            });
            return isExist;
        }

        /**
         * check if field is in join by
         * @param field
         * @param reportView
         * @returns {boolean}
         */
        function isJoinField(field, reportView) {
            var found = reportView.joinBy.find(function (join) {
                return join.outputField == field || join.outputField == field.name;
            });
            return !!found;
        }

        /**
         * Example: days_2 -> days [data set 2]
         * @param fieldName
         * @param dataSetList
         * @returns {string}
         */
        function customFieldName(fieldName, dataSetList) {
            var id = extractDataSetId(fieldName);
            var dataSetName = getDataSetNameById(id, dataSetList);
            var fieldName = removeDataSetId(fieldName);
            return fieldName + ' (' + dataSetName + ')';
        }

        /**
         * Example: concat a,b to a [b]
         * @param field
         * @param dataSetName
         * @returns {string}
         */
        function concatFieldAndDataSet(field, dataSetName) {
            return field + ' (' + dataSetName + ')';
        }

        /**
         * Example: return days from days_2
         * @param fieldName
         * @returns {null}
         */
        function removeDataSetId(fieldName) {
            if (!fieldName) {
                return null;
            }
            var index = fieldName.lastIndexOf('_');
            return fieldName.slice(0, index);
        }

        /**
         * Example: return 2 from days_2
         * @param fieldName
         * @returns {null}
         */
        function extractDataSetId(fieldName) {
            if (!fieldName) {
                return null;
            }
            var index = fieldName.lastIndexOf('_');
            return fieldName.slice(index + 1, fieldName.length);
        }

        // function for dynamic sorting
        function compareValues(key, order) {
            return function (a, b) {
                if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
                    // property doesn't exist on either object
                    return 0;
                }

                const varA = (typeof a[key] === 'string') ?
                    a[key].toUpperCase() : a[key];
                const varB = (typeof b[key] === 'string') ?
                    b[key].toUpperCase() : b[key];

                var comparison = 0;
                if (varA > varB) {
                    comparison = 1;
                } else if (varA < varB) {
                    comparison = -1;
                }
                return (
                    (order == DESC) ? (comparison * -1) : comparison
                );
            };
        }

        function toggleSort(currentState) {
            if (currentState == NONE) {
                return ASC
            } else if (currentState == ASC) {
                return DESC
            } else {
                return ASC
            }
        }
    }
})();