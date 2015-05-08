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

        function builtVariable(expressionDescriptor) {
            var convertedExpressions = '';

            if(expressionDescriptor[GROUP_TYPE] != null) {
                convertedExpressions = '(' + _buildNested(expressionDescriptor[GROUP_KEY], expressionDescriptor[GROUP_TYPE]) + ')';
            }
            else {
                var showDefaultExpression = (!expressionDescriptor.var && !expressionDescriptor.val);
                var value = (expressionDescriptor.type == DATA_TYPE[0].key && !!expressionDescriptor.val) ? '"' +  expressionDescriptor.val + '"' : expressionDescriptor.val;
                convertedExpressions += '(' + 'window.' + expressionDescriptor.var + ' ' + expressionDescriptor.cmp + ' ' + value + ') ';
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
                    var value = (group.type == DATA_TYPE[0].key && !!group.val) ? '"' + group.val + '"' : group.val;
                    var showDefaultGroup = (!group.var && !group.val) ? '()' : '(' + 'window.' + group.var + ' ' + group.cmp + ' ' + value + ') ' + type + ' ';

                    groupBuild += showDefaultGroup;
                }
            });

            return groupBuild;
        }
    }
})();
