(function () {
    'use strict';

    angular.module('tagcade.unifiedReport.dataSource')
        .constant('DATA_SOURCE_METADATA', [
            {
                key: 'filename',
                label: '__filename'
            },{
                key: 'from',
                label: '__email_from'
            },
            {
                key: 'subject',
                label: '__email_subject'
            },
            {
                key: 'body',
                label: '__email_body'
            },
            {
                key: 'dateTime',
                label: '__email_date_time'
            },
            {
                key: 'date',
                label: '__date'
            }
        ])
    ;
})();