(function () {
    'use strict';

    angular.module('tagcade.unifiedReport.alert')
        .filter('alertType', alertType)
    ;

    function alertType() {
        return function (items, alertSource) {
            var filtered = [];
            angular.forEach(items, function (item) {
                if (!angular.isObject(item)) {
                    return;
                }
                if (!(alertSource.key === 'datasource' && (item.key === 'actionRequired' || item.key === 'reminder'))) {
                    filtered.push(item);
                }
            });

            return filtered;
        }
    }
})();