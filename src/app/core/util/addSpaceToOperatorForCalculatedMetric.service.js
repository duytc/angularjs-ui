(function () {
    'use strict';

    angular.module('tagcade.core.util')
        .factory('AddCalculatedMetricUtil', AddCalculatedMetricUtil);

    function AddCalculatedMetricUtil() {
        return {
            addSpaceBeforeAndAfterOperator: addSpaceBeforeAndAfterOperator
        }
    }

    var oldString = null;

    function addSpaceBeforeAndAfterOperator(expression) {
        if (_.isEmpty(expression)) {
            return;
        }

        if (!!oldString && !!expression && !!expression.expression) {
            // do not auto format on deletion
            if (oldString.length > expression.expression.length) {
                oldString = expression.expression;
                return expression;
            }
        }

        /* get changes */
        var newCharacters = _getDifference(oldString, expression.expression);
        if (!newCharacters) {
            return expression;
        }

        /* auto format */
        var expr = expression.expression;

        // backup
        var matches = expr.match(/\[[^\]]+\]/g);
        angular.forEach(matches, function (m, index) {
            expr = expr.replace(/\[[^\]]+\]/, '___MATCH___' + index);
        });

        // format
        expr = expr.replace(/([\s]*[\+]{1}[\s]*)/g, ' + ');
        expr = expr.replace(/([\s]*[\-]{1}[\s]*)/g, ' - ');
        expr = expr.replace(/([\s]*[\*]{1}[\s]*)/g, ' * ');
        expr = expr.replace(/([\s]*[\/]{1}[\s]*)/g, ' / ');

        // restore
        angular.forEach(matches, function (m, index) {
            expr = expr.replace('___MATCH___' + index, m);
        });

        // complex regex
        // expr = expr.replace(/(\[[\sa-zA-Z0-9]+[\(]*[^\)]*[\)]*[\s]*\])([\s]*[\+]{1}[\s]*)/g, '$1 + ');

        /* set back expression */
        expression.expression = expr;

        /* save oldString for next checking */
        oldString = expression.expression;

        return expression;
    }

    function _getDifference(a, b) {
        var i = 0;
        var j = 0;
        var result = "";

        if (!a && !b) {
            return null;
        }

        if (!a) {
            return b;
        }

        if (!b) {
            return a;
        }

        while (j < b.length) {
            if (a[i] != b[j] || i == a.length)
                result += b[j];
            else
                i++;
            j++;
        }

        return result;
    }
})();