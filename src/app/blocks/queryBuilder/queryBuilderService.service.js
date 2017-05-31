(function() {
    'use strict';

    angular.module('tagcade.blocks.queryBuilder')
        .factory('queryBuilderService', queryBuilderService)
    ;

    function queryBuilderService(GROUP_TYPE, GROUP_KEY, DATA_TYPE, CONDITIONS_STRING, CONDITIONS_NUMERIC, CONDITIONS_BOOLEAN) {
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

            if (myVar == '${PAGE_URL}') {
                trueJsVariable = 'location.href';
            }
            else if (myVar == '${COUNTRY}') {
                trueJsVariable = '${COUNTRY}';
            }
            else if (myVar == '${DEVICE}') {
                trueJsVariable = '${DEVICE}';
            }
            else if (myVar == '${USER_AGENT}') {
                trueJsVariable = 'navigator.userAgent';
            }
            else if (myVar == '${SCREEN_WIDTH}') {
                trueJsVariable = 'top.screen.width';
            }
            else if (myVar == '${SCREEN_HEIGHT}') {
                trueJsVariable = 'top.screen.height';
            }
            else if (myVar == '${WINDOW_WIDTH}') {
                trueJsVariable = 'top.screen.outerWidth';
            }
            else if (myVar == '${WINDOW_HEIGHT}') {
                trueJsVariable = 'top.screen.outerHeight';
            }
            else if(myVar == '${DOMAIN}') {
                trueJsVariable = 'top.location.hostname';
            }
            else if(!!myVar) {
                trueJsVariable = 'window.' + myVar;
            }

            return trueJsVariable;
        }

        function _getComparatorConfig(comparator, dataType, variable) {
            var CONDITIONS;

            if(dataType == DATA_TYPE[0].key) {
                CONDITIONS = CONDITIONS_STRING;
            }
            else if(dataType == DATA_TYPE[1].key) {
                CONDITIONS = CONDITIONS_NUMERIC;
            }
            else {
                CONDITIONS = CONDITIONS_BOOLEAN;
            }

            for(var i = 0; i < CONDITIONS.length; i++) {
                if (comparator == CONDITIONS[i].key && CONDITIONS[i].unsupportedBuiltInVars.indexOf(variable) == -1) {
                    return CONDITIONS[i];
                }
            }

            return '';
        }

        function _getJSStringFromPattern(jsPattern, variable, value) {
            if(!variable || (!variable && !value) || !jsPattern) {
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
                    var variable = _getConvertedVariable(group.customVar == 'CUSTOM' || !group.customVar ? group.var : group.customVar);

                    var value = !group.val ? "" : group.val;

                    var cmpConfig = _getComparatorConfig(group.cmp, group.type, group.customVar == 'CUSTOM' || !group.customVar ? group.var : group.customVar);
                    var defaultGroupLabel = '';

                    if(typeof value == 'object') {
                        angular.forEach(value, function(item, key) {
                            var typeForValueObject =  key+1 == value.length ? '' : group.cmp == 'isNot' ? '<strong>' + 'AND' + '</strong>': '<strong>' + 'OR' + '</strong>';
                            defaultGroupLabel = defaultGroupLabel + _getJSStringFromPattern(cmpConfig.jsPattern, variable, item) + typeForValueObject + ' ';
                        })
                    } else {
                        value = value.replace(/[/]/g, '\/');
                        value = value.replace(/[&]/g, '\&');
                        value = value.replace(/[-]/g, '\-');
                        value = value.replace(/[?]/g, '\?');
                        value = value.replace(/[$]/g, '$$$$');

                        defaultGroupLabel = _getJSStringFromPattern(cmpConfig.jsPattern, variable, value);
                    }

                    groupBuild += defaultGroupLabel + type + ' ';
                }
            });

            return groupBuild;
        }
    }
})();
