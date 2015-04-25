(function() {
    'use strict';

    angular.module('tagcade.blocks.queryBuilder')
        .constant('CONDITIONS', ['==', '!=', '<', '<=', '>', '>='])
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
        .constant('OPERATORS', [
            { name: 'AND' },
            { name: 'OR' }
        ])
        .constant('DATA_TYPE', ['STRING', 'NUMERIC', 'BOOLEAN'])
        .constant('GROUP_KEY', 'groupVal')
        .constant('GROUP_TYPE', 'groupType')
    ;
})();