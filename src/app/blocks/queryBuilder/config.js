(function() {
    'use strict';

    angular.module('tagcade.blocks.queryBuilder')
        .constant('CONDITIONS_NUMERIC', [
            {key: '==', label: 'EQUAL TO'},
            {key: '!=', label: 'NOT EQUAL TO' },
            {key: '<', label: 'LESS THAN' },
            {key: '<=', label: 'LESS THAN OR EQUAL TO'},
            {key: '>', label: 'GREATER THAN'},
            {key: '>=', label: 'GREATER THAN OR EQUAL TO'}
        ])
        .constant('CONDITIONS_BOOLEAN', [
            {key: '==', label: 'EQUAL TO'},
            {key: '!=', label: 'NOT EQUAL TO' }
        ])
        .constant('CONDITIONS_STRING', [
            {key: '==', label: 'EQUAL TO', jsPattern: '({VARIABLE} == "{VALUE}") '},
            {key: '!=', label: 'NOT EQUAL TO' , jsPattern: '({VARIABLE} != "{VALUE}") '},
            {key: 'contains', label:'CONTAINS', jsPattern: '({VARIABLE}.search(/{VALUE}/i) > -1) '},
            {key: 'notContains', label:'DOES NOT CONTAIN', jsPattern: '({VARIABLE}.search(/{VALUE}/i) < 0) '},
            {key: 'startsWith', label:'STARTS WITH', jsPattern: '({VARIABLE}.search(/{VALUE}/i) === 0) '},
            {key: 'notStartsWith', label:'DOES NOT START WITH', jsPattern: '({VARIABLE}.search(/{VALUE}/i) !== 0) '},
            {key: 'endsWith', label:'ENDS WITH', jsPattern: '({VARIABLE}.search(/{VALUE}$/i) === {VARIABLE}.length - "{VALUE}".length) '},
            {key: 'notEndsWith', label:'DOES NOT END WITH', jsPattern: '({VARIABLE}.search(/{VALUE}$/i) !== {VARIABLE}.length - "{VALUE}".length) '}
        ])
        .constant('OPERATORS', ['AND' , 'OR'])
        .constant('DATA_TYPE', [
            {key: 'string', label: 'TEXT'},
            {key: 'numeric', label: 'NUMBER'},
            {key: 'boolean', label: 'TRUE/FALSE'}
        ])
        .constant('GROUP_KEY', 'groupVal')
        .constant('GROUP_TYPE', 'groupType')
    ;
})();