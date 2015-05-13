(function() {
    'use strict';

    angular.module('tagcade.blocks.queryBuilder')
        .factory('queryBuilderService', queryBuilderService)
    ;

    function queryBuilderService(GROUP_TYPE, GROUP_KEY, DATA_TYPE, CONDITIONS_STRING) {
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

                if(expressionDescriptor.cmp == CONDITIONS_STRING[2].key) {
                    convertedExpressions += '(' + 'window.' + expressionDescriptor.var + '.search(/' + expressionDescriptor.val + '/i) > -1' + ')';
                }
                else if(expressionDescriptor.cmp == CONDITIONS_STRING[3].key) {
                    convertedExpressions += '(' + 'window.' + expressionDescriptor.var + '.search(/' + expressionDescriptor.val + '/i) < 0' + ')';
                }
                else if(expressionDescriptor.cmp == CONDITIONS_STRING[4].key) {
                    convertedExpressions += '(' + 'window.' + expressionDescriptor.var + '.search(/' + expressionDescriptor.val + '/i) === 0' + ')';
                }
                else if(expressionDescriptor.cmp == CONDITIONS_STRING[5].key) {
                    convertedExpressions += '(' + 'window.' + expressionDescriptor.var + '.search(/' + expressionDescriptor.val + '/i) !== 0' + ')';
                }
                else if(expressionDescriptor.cmp == CONDITIONS_STRING[6].key) {
                    convertedExpressions += '(' + 'window.' + expressionDescriptor.var + '.search(/' + expressionDescriptor.val + '$/i) === window.'+ expressionDescriptor.var +'.length - ' + value + '.length)';
                }
                else if(expressionDescriptor.cmp == CONDITIONS_STRING[7].key) {
                    convertedExpressions += '(' + 'window.' + expressionDescriptor.var + '.search(/' + expressionDescriptor.val + '$/i) 1== window.'+ expressionDescriptor.var +'.length - ' + value + '.length)';
                }
                else {
                    convertedExpressions += '(' + 'window.' + expressionDescriptor.var + ' ' + expressionDescriptor.cmp + ' ' + value + ') ';
                }
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
                    var showDefaultGroup = null;

                    if(group.cmp == CONDITIONS_STRING[2].key) {
                        showDefaultGroup = '(' + 'window.' + group.var + '.search(/' + group.val + '/i) > -1' + ') ' + type + ' ';
                    }
                    else if(group.cmp == CONDITIONS_STRING[3].key) {
                        showDefaultGroup = '(' + 'window.' + group.var + '.search(/' + group.val + '/i) < 0' + ') ' + type + ' ';
                    }
                    else if(group.cmp == CONDITIONS_STRING[4].key) {
                        showDefaultGroup = '(' + 'window.' + group.var + '.search(/' + group.val + '/i) === 0' + ') ' + type + ' ';
                    }
                    else if(group.cmp == CONDITIONS_STRING[5].key) {
                        showDefaultGroup = '(' + 'window.' + group.var + '.search(/' + group.val + '/i) !== 0' + ') ' + type + ' ';
                    }
                    else if(group.cmp == CONDITIONS_STRING[6].key) {
                        showDefaultGroup = '(' + 'window.' + group.var + '.search(/' + group.val + '$/i) === window.'+ group.var +'.length - ' + value + '.length)' + type + ' ';
                    }
                    else if(group.cmp == CONDITIONS_STRING[7].key) {
                        showDefaultGroup = '(' + 'window.' + group.var + '.search(/' + group.val + '$/i) !== window.'+ group.var +'.length - ' + value + '.length)' + type + ' ';
                    }
                    else {
                        showDefaultGroup = '(' + 'window.' + group.var + ' ' + group.cmp + ' ' + value + ') ' + type + ' ';
                    }

                    groupBuild += (!group.var && !group.val) ? '()' : showDefaultGroup;
                }
            });

            return groupBuild;
        }
    }
})();
