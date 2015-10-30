(function() {
    'use strict';

    angular.module('tagcade.blocks.queryBuilder')
        .constant('CONDITIONS_NUMERIC', [
            {key: '==', label: 'EQUAL TO', jsPattern: '({VARIABLE} == {VALUE}) ', unsupportedBuiltInVars: []},
            {key: '!=', label: 'NOT EQUAL TO', jsPattern: '({VARIABLE} != {VALUE}) ', unsupportedBuiltInVars: []},
            {key: '<', label: 'LESS THAN', jsPattern: '({VARIABLE} < {VALUE}) ', unsupportedBuiltInVars: []},
            {key: '<=', label: 'LESS THAN OR EQUAL TO', jsPattern: '({VARIABLE} <= {VALUE}) ', unsupportedBuiltInVars: []},
            {key: '>', label: 'GREATER THAN', jsPattern: '({VARIABLE} > {VALUE}) ', unsupportedBuiltInVars: []},
            {key: '>=', label: 'GREATER THAN OR EQUAL TO', jsPattern: '({VARIABLE} >= {VALUE}) ', unsupportedBuiltInVars: []}
        ])
        .constant('CONDITIONS_BOOLEAN', [
            {key: '==', label: 'EQUAL TO', jsPattern: '({VARIABLE} == {VALUE}) ', unsupportedBuiltInVars: []},
            {key: '!=', label: 'NOT EQUAL TO', jsPattern: '({VARIABLE} != {VALUE}) ', unsupportedBuiltInVars: []}
        ])
        .constant('CONDITIONS_STRING', [
            {key: '==', label: 'EQUAL TO', jsPattern: '({VARIABLE} == "{VALUE}") ', unsupportedBuiltInVars: []},
            {key: '!=', label: 'NOT EQUAL TO', jsPattern: '({VARIABLE} != "{VALUE}") ', unsupportedBuiltInVars: []},
            {key: 'contains', label:'CONTAINS', jsPattern: '({VARIABLE}.search(/{VALUE}/i) > -1) ', unsupportedBuiltInVars: ['${COUNTRY}']},
            {key: 'notContains', label:'DOES NOT CONTAIN', jsPattern: '({VARIABLE}.search(/{VALUE}/i) < 0) ', unsupportedBuiltInVars: ['${COUNTRY}']},
            {key: 'startsWith', label:'STARTS WITH', jsPattern: '({VARIABLE}.search(/{VALUE}/i) === 0) ', unsupportedBuiltInVars: ['${COUNTRY}']},
            {key: 'notStartsWith', label:'DOES NOT START WITH', jsPattern: '({VARIABLE}.search(/{VALUE}/i) !== 0) ', unsupportedBuiltInVars: ['${COUNTRY}']},
            {key: 'endsWith', label:'ENDS WITH', jsPattern: '({VARIABLE}.search(/{VALUE}$/i) === {VARIABLE}.length - "{VALUE}".length) ', unsupportedBuiltInVars: ['${COUNTRY}']},
            {key: 'notEndsWith', label:'DOES NOT END WITH', jsPattern: '({VARIABLE}.search(/{VALUE}$/i) !== {VARIABLE}.length - "{VALUE}".length) ', unsupportedBuiltInVars: ['${COUNTRY}']}
        ])
        .constant('OPERATORS', ['AND' , 'OR'])
        .constant('DATA_TYPE', [
            {key: 'string', label: 'TEXT', builtInVars: ['${USER_AGENT}', '${DOMAIN}', '${COUNTRY}', '${PAGE_URL}', '${PAGEURL}']},
            {key: 'numeric', label: 'NUMBER', builtInVars: ['${SCREEN_WIDTH}', '${SCREEN_HEIGHT}', '${WINDOW_WIDTH}', '${WINDOW_HEIGHT}']},
            {key: 'boolean', label: 'TRUE/FALSE', builtInVars: []}
        ])
        .constant('GROUP_KEY', 'groupVal')
        .constant('GROUP_TYPE', 'groupType')
    ;
})();