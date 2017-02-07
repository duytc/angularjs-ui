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
            {key: '==', label: 'EQUAL TO', jsPattern: '({VARIABLE} == "{VALUE}") ', unsupportedBuiltInVars: ['${COUNTRY}', '${DEVICE}']},
            {key: '!=', label: 'NOT EQUAL TO', jsPattern: '({VARIABLE} != "{VALUE}") ', unsupportedBuiltInVars: ['${COUNTRY}', '${DEVICE}']},

            {key: 'is', label: 'IS', jsPattern: '(navigator.userAgent.search(/{VALUE}/i) > -1) ', unsupportedBuiltInVars: ['${COUNTRY}'], onlySupport: ['${DEVICE}']},
            {key: 'isNot', label: 'IS NOT', jsPattern: '(navigator.userAgent.search(/{VALUE}/i) < 0) ', unsupportedBuiltInVars: ['${COUNTRY}'], onlySupport: ['${DEVICE}']},

            {key: 'is', label: 'IS', jsPattern: '({VARIABLE} == "{VALUE}") ', unsupportedBuiltInVars: ['${DEVICE}'], onlySupport: ['${COUNTRY}']},
            {key: 'isNot', label: 'IS NOT', jsPattern: '({VARIABLE} != "{VALUE}") ', unsupportedBuiltInVars: ['${DEVICE}'], onlySupport: ['${COUNTRY}']},

            {key: 'contains', label:'CONTAINS', jsPattern: '({VARIABLE}.search(/{VALUE}/i) > -1) ', unsupportedBuiltInVars: ['${COUNTRY}', '${DEVICE}']},
            {key: 'notContains', label:'DOES NOT CONTAIN', jsPattern: '({VARIABLE}.search(/{VALUE}/i) < 0) ', unsupportedBuiltInVars: ['${COUNTRY}', '${DEVICE}']},
            {key: 'startsWith', label:'STARTS WITH', jsPattern: '({VARIABLE}.search(/{VALUE}/i) === 0) ', unsupportedBuiltInVars: ['${COUNTRY}', '${DEVICE}']},
            {key: 'notStartsWith', label:'DOES NOT START WITH', jsPattern: '({VARIABLE}.search(/{VALUE}/i) !== 0) ', unsupportedBuiltInVars: ['${COUNTRY}', '${DEVICE}']},
            {key: 'endsWith', label:'ENDS WITH', jsPattern: '({VARIABLE}.search(/{VALUE}$/i) === {VARIABLE}.length - "{VALUE}".length) ', unsupportedBuiltInVars: ['${COUNTRY}', '${DEVICE}']},
            {key: 'notEndsWith', label:'DOES NOT END WITH', jsPattern: '({VARIABLE}.search(/{VALUE}$/i) !== {VARIABLE}.length - "{VALUE}".length) ', unsupportedBuiltInVars: ['${COUNTRY}', '${DEVICE}']}
        ])
        .constant('OPERATORS', ['AND' , 'OR'])
        .constant('DATA_TYPE', [
            {key: 'string', label: 'TEXT', builtInVars: ['${USER_AGENT}', '${DOMAIN}', '${COUNTRY}', '${PAGE_URL}', '${PAGEURL}', '${DEVICE}']},
            {key: 'numeric', label: 'NUMBER', builtInVars: ['${SCREEN_WIDTH}', '${SCREEN_HEIGHT}', '${WINDOW_WIDTH}', '${WINDOW_HEIGHT}']},
            {key: 'boolean', label: 'TRUE/FALSE', builtInVars: []}
        ])
        .constant('DEVICES', [
            {code: 'iPad|iPhone|iPod', name: 'iOS'},
            {code: 'Android', name: 'Android'},
            {code: 'Windows Phone 10.0', name: 'Windows 10 Mobile'},
            {code: 'BB10', name: 'BlackBerry 10'},
            {code: 'Mobile.*Firefox', name: 'Firefox OS'},
            {code: 'Sailfish', name: 'Sailfish OS'},
            {code: 'Tizen', name: 'Tizen'},
            {code: 'Ubuntu', name: 'Ubuntu Touch OS'}
        ])
        .constant('GROUP_KEY', 'groupVal')
        .constant('GROUP_TYPE', 'groupType')
    ;
})();