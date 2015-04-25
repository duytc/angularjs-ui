(function() {
    'use strict';

    angular.module('tagcade.blocks.queryBuilder')
        .factory('queryBuilderService', queryBuilderService)
    ;

    function queryBuilderService(GROUP_TYPE, GROUP_KEY, DATA_TYPE) {
        var api = {
            builtVariable: builtVariable
        };

        return api;

        function builtVariable(expression) {
            var convertedExpressions = '';

            if(expression[GROUP_TYPE] != null) {
                convertedExpressions = '(' + _buildNested(expression[GROUP_KEY], expression[GROUP_TYPE]) + ')';
            }
            else {
                var showDefaultExpression = (!expression.var && !expression.val);
                var value = (expression.type == DATA_TYPE[0] && !!expression.val) ? '"' +  expression.val + '"' : expression.val;
                convertedExpressions += '(' + expression.var + ' ' + expression.cmp + ' ' + value + ') ';
            }

            return showDefaultExpression ? '()' : convertedExpressions;
        }

        function _buildNested(groups, groupType) {
            var groupBuild = '';

            angular.forEach(groups, function(group, index) {
                if(group[GROUP_TYPE] != null) {
                    groupBuild += '(' + _buildNested(group[GROUP_KEY], group[GROUP_TYPE]) + ')';
                }
                else {
                    var type = (groups.length -1 != index) ? '<strong>' + groupType + '</strong>' : '';
                    var value = (group.type == DATA_TYPE[0] && !!group.val) ? '"' +  group.val + '"' : group.val;
                    var showDefaultGroup = (!group.var && !group.val) ? '()' : '(' + group.var + ' ' + group.cmp + ' ' + value + ') ' + type + ' ';

                    groupBuild += showDefaultGroup;
                }
            });

            return groupBuild;
        }
    }
})();
