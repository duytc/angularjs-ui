(function() {
    'use strict';

    angular.module('tagcade.unifiedReport.dataSourceFile')
        .constant('RECEIVED_METHOD', [
            {key: 'upload', label: 'Upload'},
            {key: 'email', label: 'Email'},
            {key: 'api', label: 'API'}
        ])
    ;
})();