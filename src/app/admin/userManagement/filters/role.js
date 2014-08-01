angular.module('tagcade.admin.userManagement')

    .filter('roleFormat', function () {
        return function (text) {
            text = text.toUpperCase();
            text = text.replace(/^(ROLE|FEATURE)_/, '');
            text = text.replace(/_/g, ' ');
            return text;
        };
    })

;