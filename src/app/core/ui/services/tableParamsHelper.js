angular.module('tagcade.core.ui')

    .factory('TableParamsHelper', function () {

        return {
            getFilters: function (originalFilters) {
                if (!angular.isObject(originalFilters)) {
                    return null;
                }

                var filters = {};

                angular.forEach(originalFilters, function(value, key) {
                    if (key.indexOf('.') === -1) {
                        filters[key] = value;
                        return;
                    }

                    var createObjectTree = function (tree, properties, value) {
                        if (!properties.length) {
                            return value;
                        }

                        var prop = properties.shift();

                        if (!prop || !/^[a-zA-Z]/.test(prop)) {
                            throw new Error('invalid nested property name for filter');
                        }

                        tree[prop] = createObjectTree({}, properties, value);

                        return tree;
                    };

                    var filter = createObjectTree({}, key.split('.'), value);

                    angular.extend(filters, filter);
                });

               return filters;
            }
        };
    })

;
