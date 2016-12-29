(function() {
    'use strict';

    angular.module('tagcade.unifiedReport')
        .constant('FILE_TYPE_OPTIONS', [
            {key: 'csv', label: 'CSV'},
            {key: 'excel', label: 'Excel'},
            {key: 'json', label: 'Json'}
        ]);
})();
