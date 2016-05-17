(function() {
    'use strict';

    angular.module('tagcade.tagManagement')
        .constant('RTB_STATUS_TYPES', {inherit: 2, enable: 1, disable: 0})
        .constant('RTB_STATUS_LABELS', {0: 'Disabled', 1 : 'Enabled', 2: 'Inherited'});
})();