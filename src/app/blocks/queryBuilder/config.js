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
            {key: '==', label: 'EQUAL TO', jsPattern: '({VARIABLE} == "{VALUE}") ', unsupportedBuiltInVars: ['${COUNTRY}', '${DEVICE}', '${DOMAIN}']},
            {key: '!=', label: 'NOT EQUAL TO', jsPattern: '({VARIABLE} != "{VALUE}") ', unsupportedBuiltInVars: ['${COUNTRY}', '${DEVICE}', '${DOMAIN}']},

            {key: 'is', label: 'IS', jsPattern: '(navigator.userAgent.search(/{VALUE}/i) > -1) ', unsupportedBuiltInVars: ['${COUNTRY}', '${DOMAIN}'], onlySupport: ['${DEVICE}']},
            {key: 'isNot', label: 'IS NOT', jsPattern: '(navigator.userAgent.search(/{VALUE}/i) < 0) ', unsupportedBuiltInVars: ['${COUNTRY}', '${DOMAIN}'], onlySupport: ['${DEVICE}']},

            {key: 'is', label: 'IS', jsPattern: '({VARIABLE} == "{VALUE}") ', unsupportedBuiltInVars: ['${DEVICE}', '${DOMAIN}'], onlySupport: ['${COUNTRY}']},
            {key: 'isNot', label: 'IS NOT', jsPattern: '({VARIABLE} != "{VALUE}") ', unsupportedBuiltInVars: ['${DEVICE}', '${DOMAIN}'], onlySupport: ['${COUNTRY}']},

            {key: 'contains', label:'CONTAINS', jsPattern: '({VARIABLE}.search(/{VALUE}/i) > -1) ', unsupportedBuiltInVars: ['${COUNTRY}', '${DEVICE}', '${DOMAIN}']},
            {key: 'notContains', label:'DOES NOT CONTAIN', jsPattern: '({VARIABLE}.search(/{VALUE}/i) < 0) ', unsupportedBuiltInVars: ['${COUNTRY}', '${DEVICE}', '${DOMAIN}']},
            {key: 'startsWith', label:'STARTS WITH', jsPattern: '({VARIABLE}.search(/{VALUE}/i) === 0) ', unsupportedBuiltInVars: ['${COUNTRY}', '${DEVICE}', '${DOMAIN}']},
            {key: 'notStartsWith', label:'DOES NOT START WITH', jsPattern: '({VARIABLE}.search(/{VALUE}/i) !== 0) ', unsupportedBuiltInVars: ['${COUNTRY}', '${DEVICE}', '${DOMAIN}']},
            {key: 'endsWith', label:'ENDS WITH', jsPattern: '({VARIABLE}.search(/{VALUE}$/i) === {VARIABLE}.length - "{VALUE}".length) ', unsupportedBuiltInVars: ['${COUNTRY}', '${DEVICE}', '${DOMAIN}']},
            {key: 'notEndsWith', label:'DOES NOT END WITH', jsPattern: '({VARIABLE}.search(/{VALUE}$/i) !== {VARIABLE}.length - "{VALUE}".length) ', unsupportedBuiltInVars: ['${COUNTRY}', '${DEVICE}', '${DOMAIN}']},

            {key: 'inBlacklist', label: 'IN BLACKLIST', jsPattern: '(${DOMAIN} in blacklist({VALUE})) ', blacklist: true, onlySupport: ['${DOMAIN}'], unsupportedBuiltInVars: []},
            {key: 'inWhitelist', label: 'IN WHITELIST', jsPattern: '(${DOMAIN} in whitelist({VALUE})) ', blacklist: false, onlySupport: ['${DOMAIN}'], unsupportedBuiltInVars: []},
            {key: 'notInBlacklist', label: 'NOT IN BLACKLIST', jsPattern: '(${DOMAIN} not in blacklist({VALUE})) ', blacklist: true, onlySupport: ['${DOMAIN}'], unsupportedBuiltInVars: []},
            {key: 'notInWhitelist', label: 'NOT IN WHITELIST', jsPattern: '(${DOMAIN} not in whitelist({VALUE})) ', blacklist: false, onlySupport: ['${DOMAIN}'], unsupportedBuiltInVars: []}
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
        .constant('VARIABLE_FOR_AD_TAG', [
            {key: "${PAGE_URL}", label: 'PAGE URL'},
            {key: "${USER_AGENT}", label: 'USER AGENT'},
            {key: "${COUNTRY}", label: 'COUNTRY'},
            {key: "${SCREEN_WIDTH}", label: 'SCREEN WIDTH'},
            {key: "${SCREEN_HEIGHT}", label: 'SCREEN HEIGHT'},
            {key: "${WINDOW_WIDTH}", label: 'WINDOW WIDTH'},
            {key: "${WINDOW_HEIGHT}", label: 'WINDOW HEIGHT'},
            {key: "${DOMAIN}", label: 'DOMAIN'},
            {key: "${DEVICE}", label: 'DEVICE'}]
        )
    ;
})();