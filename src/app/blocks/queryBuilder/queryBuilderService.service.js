(function() {
    'use strict';

    angular.module('tagcade.blocks.queryBuilder')
        .factory('queryBuilderService', queryBuilderService)
    ;

    function queryBuilderService(GROUP_TYPE, GROUP_KEY, CONDITIONS_STRING) {
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

        function _getConvertedVariable(myVar) {
            var trueJsVariable = myVar;

            if (myVar == '${PAGEURL}') {
                trueJsVariable = 'window.location.href';
            }
            else if (myVar == '${COUNTRY}') {
                trueJsVariable = '${COUNTRY}';
            }
            else if (myVar == '${USERAGENT}') {
                trueJsVariable = 'window.navigator.userAgent';
            }
            else if(!!myVar) {
                    trueJsVariable = 'window.' + myVar;
            }

            return trueJsVariable;
        }

        function _getComparatorConfig(comparator) {
            for(var i = 0; i < CONDITIONS_STRING.length; i++) {
                if (comparator == CONDITIONS_STRING[i].key) {
                    return CONDITIONS_STRING[i];
                }
            }

            return '';
        }

        function _getJSStringFromPattern(jsPattern, variable, value) {
            if(!variable || (!variable && !value)) {
                return '()';
            }

            jsPattern = jsPattern.replace(/{VARIABLE}/g, variable);
            jsPattern = jsPattern.replace(/{VALUE}/g, value);

            return jsPattern;
        }

        function _buildNested(groups, groupType) {
            var groupBuild = '';

            angular.forEach(groups, function(group, index) {
                var type = (groups.length -1 != index) ? '<strong>' + groupType + '</strong>' : '';

                if(group[GROUP_TYPE] != null) {
                    groupBuild += '(' + _buildNested(group[GROUP_KEY], group[GROUP_TYPE]) + ') ' + type + ' ';
                }
                else {
                    var variable = _getConvertedVariable(group.var);

                    var value = !group.val ? "" : group.val;
                    value = value.replace(/[/]/g, '\\/');
                    value = value.replace(/[&]/g, '\\&');
                    value = value.replace(/[-]/g, '\\-');
                    value = value.replace(/[?]/g, '\\?');

                    var cmpConfig = _getComparatorConfig(group.cmp);
                    var defaultGroupLabel = _getJSStringFromPattern(cmpConfig.jsPattern, variable, value) + type + ' ';

                    groupBuild += defaultGroupLabel;
                }
            });

            return groupBuild;
        }
    }
})();
