(function () {
    'use strict';

    angular.module('tagcade.core.util')
        .factory('AddCalculatedField', AddCalculatedField);

    function AddCalculatedField() {

        return {
            addSpaceBeforeAndAfterOperator: addSpaceBeforeAndAfterOperator
        }
    }

    var oldString = null;

    function addSpaceBeforeAndAfterOperator(expression) {
        var newCharacters = getDifference(oldString, expression.expression),
            subString, positions;

        switch (newCharacters) {
            case  ' *':
            case '*':
            case ' +':
            case '+':
            case  ' -':
            case '-':
            case  ' /':
            case '/':
            {
                //expression.expression = expression.expression.replace(/[/]/g, '  /  ');
                positions = getAllIndexOfCharacter(expression.expression, newCharacters);

                _.each(positions, function (position) {
                    if (_.isUndefined(expression.expression[position + 1]) || (expression.expression[position + 1] !=' ' && expression.expression[position - 1] !=' ' )) {
                        var firstString = expression.expression.substring(0, position);
                        var lastString = expression.expression.substring(position + newCharacters.length, expression.expression.length);

                        expression.expression = firstString.concat('  ').concat(newCharacters).concat('  ').concat(lastString);
                    }
                });
                break;
            }
            case  ' (':
            case '(':
            {
                positions = getAllIndexOfCharacter(expression.expression, '(');

                _.each(positions, function (position) {
                    if (_.isUndefined(expression.expression[position + 1]) || expression.expression[position + 1] =='[') {
                        var firstString = expression.expression.substring(0, position + 1);
                        var lastString = expression.expression.substring(position + 1, expression.expression.length);

                        expression.expression = firstString.concat('  ').concat(lastString);
                    }
                });
                break;
            }
            case  ' )':
            case ')':
            {
                subString = expression.expression.substring(0, expression.expression.length - 1);
                expression.expression = subString + '  )';
                break;
            }
        }

        oldString = expression.expression;

        return expression;
    }

    function getAllIndexOfCharacter(word, character) {
        var positions = [],
            index = word.indexOf(character);

        while (index >= 0) {
            positions.push(index);
            index = word.indexOf(character, index + 1);
        }

        return positions;
    }

    function getDifference(a, b) {
        var i = 0;
        var j = 0;
        var result = "";

        if (_.isNull(a) && _.isNull(b)) {
            return null;
        }

        if (_.isNull(a)) {
            return b;
        }

        if (_.isNull(b)) {
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