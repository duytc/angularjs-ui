(function () {
    'use strict';

    angular.module('tagcade.blocks.misc')
        .filter('selectedPublisher', selectedPublisher)
    ;

    function selectedPublisher(Auth) {
        return function (items, publisherId) {
            if(Auth.isSubPublisher()) {
                return items;
            }

            if (angular.isObject(publisherId) && publisherId.id) {
                // allow user to pass in a publisher object
                publisherId = publisherId.id;
            }

            publisherId = parseInt(publisherId, 10);

            if (!publisherId) {
                return items;
            }

            var filtered = [];

            angular.forEach(items, function(item) {
                if (!angular.isObject(item)) {
                    return;
                }

                try {
                    // we use item.id == null for the option to indicate 'All" at the moment
                    if (item.id == null || publisherId === item.publisher.id) {
                        filtered.push(item);
                    }
                } catch (e) {}
            });

            return filtered;
        }
    }
})();