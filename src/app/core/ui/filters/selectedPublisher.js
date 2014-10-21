angular.module('tagcade.core.ui')

    .filter('selectedPublisher', function () {
        return function (items, publisherId) {
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
                    if (publisherId === item.publisher.id) {
                        filtered.push(item);
                    }
                } catch (e) {}
            });

            return filtered;
        }
    })

;