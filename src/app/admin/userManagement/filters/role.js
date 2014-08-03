angular.module('tagcade.admin.userManagement')

    .filter('roleFormat', function () {
        'use strict';

        return function (text) {
            text = text.toUpperCase();
            text = text.replace(/^(ROLE|FEATURE)_/, '');
            text = text.replace(/_/g, ' ');
            return text;
        };
    })

;