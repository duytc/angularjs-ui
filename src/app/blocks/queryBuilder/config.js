(function() {
    'use strict';

    angular.module('tagcade.blocks.queryBuilder')
        .constant('CONDITIONS', [
            {key: '==', label: 'EQUAL TO'},
            {key: '!=', label: 'NOT EQUAL TO' },
            {key: '<', label: 'LESS THAN' },
            {key: '<=', label: 'LESS THAN OR EQUAL TO'},
            {key: '>', label: 'GREATER THAN'},
            {key: '>=', label: 'GREATER THAN OR EQUAL TO'}
        ])
        //.constant('CONDITIONS', [
        //    { name: '==' },
        //    { name: '!=' },
        //    { name: '<' },
        //    { name: '<=' },
        //    { name: '>' },
        //    { name: '>=' },
        //    { name: 'length ==' },
        //    { name: 'length !=' },
        //    { name: 'length <' },
        //    { name: 'length <=' },
        //    { name: 'length >' },
        //    { name: 'length >=' },
        //    { name: 'startWith' },
        //    { name: 'endWith' }
        //])
        .constant('OPERATORS', ['AND' , 'OR'])
        .constant('DATA_TYPE', ['STRING', 'NUMERIC', 'BOOLEAN'])
        .constant('GROUP_KEY', 'groupVal')
        .constant('GROUP_TYPE', 'groupType')
    ;
})();