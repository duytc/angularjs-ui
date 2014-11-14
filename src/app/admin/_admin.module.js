(function () {
    'use strict';

    angular.module('tagcade.admin', [
        'ui.router',

        'tagcade.core',

        'tagcade.admin.dashboard',
        'tagcade.admin.userManagement'
    ]);
})();