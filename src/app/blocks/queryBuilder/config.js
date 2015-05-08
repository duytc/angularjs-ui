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
            {key: '==', label: 'EQUAL TO'},
            {key: '!=', label: 'NOT EQUAL TO' },
            {key: 'contains', label:'CONTAINS'},
            {key: 'startsWith', label:'STARTS WITH'},
            {key: 'endsWith', label:'ENDS WITH'}
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