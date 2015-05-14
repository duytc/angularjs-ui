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

            if(expressionDescriptor[GROUP_KEY].length < 2) {
                convertedExpressions = _buildNested(expressionDescriptor[GROUP_KEY], expressionDescriptor[GROUP_TYPE]);
            }
            else {
                convertedExpressions = '(' + _buildNested(expressionDescriptor[GROUP_KEY], expressionDescriptor[GROUP_TYPE]) + ')';
            }

            return convertedExpressions;
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
                    var variable = group.var == '${PAGEURL}' ? 'location.href' : group.var;

                    if(group.cmp == CONDITIONS_STRING[2].key) {
                        showDefaultGroup = '(' + 'window.' + variable + '.search(/' + group.val + '/i) > -1' + ') ' + type + ' ';
                    }
                    else if(group.cmp == CONDITIONS_STRING[3].key) {
                        showDefaultGroup = '(' + 'window.' + variable + '.search(/' + group.val + '/i) < 0' + ') ' + type + ' ';
                    }
                    else if(group.cmp == CONDITIONS_STRING[4].key) {
                        showDefaultGroup = '(' + 'window.' + variable + '.search(/' + group.val + '/i) === 0' + ') ' + type + ' ';
                    }
                    else if(group.cmp == CONDITIONS_STRING[5].key) {
                        showDefaultGroup = '(' + 'window.' + variable + '.search(/' + group.val + '/i) !== 0' + ') ' + type + ' ';
                    }
                    else if(group.cmp == CONDITIONS_STRING[6].key) {
                        showDefaultGroup = '(' + 'window.' + variable + '.search(/' + group.val + '$/i) === window.'+ variable +'.length - ' + value + '.length)' + type + ' ';
                    }
                    else if(group.cmp == CONDITIONS_STRING[7].key) {
                        showDefaultGroup = '(' + 'window.' + variable + '.search(/' + group.val + '$/i) !== window.'+ variable +'.length - ' + value + '.length)' + type + ' ';
                    }
                    else {
                        showDefaultGroup = '(' + 'window.' + variable + ' ' + group.cmp + ' ' + value + ') ' + type + ' ';
                    }

                    groupBuild += (!variable && !group.val) ? '()' : showDefaultGroup;
                }
            });

            return groupBuild;
        }
    }
})();
