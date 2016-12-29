(function() {
    'use strict';

    angular.module('tagcade.unifiedReport.dataSourceFile')
        .constant('RECEIVED_METHOD', [
            {key: 'upload', label: 'Upload'},
            {key: 'email', label: 'Email'},
            {key: 'api', label: 'API'}
        ])
        .constant('BASE_URL_UPLOAD_DATA_SOURCES','http://api.unified-reports.dev/app_dev.php/api/v1/datasources/%dataSourceId%/upload')
    ;
})();