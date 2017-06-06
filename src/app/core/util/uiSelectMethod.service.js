(function() {
    'use strict';

    angular.module('tagcade.core.util')
        .factory('UISelectMethod', UISelectMethod)
    ;

    function UISelectMethod() {
        return {
            addAllOption : function(data, label) {
                if (!angular.isArray(data)) {
                    throw new Error('Expected an array of data');
                }

                data.unshift({
                    id: null, // default value
                    name: label || 'All',
                    company: label || 'All'
                });

                return data;
            },

            groupEntities: function(item) {
                if (item.id === null) {
                    return undefined; // no group
                }

                return ''; // separate group with no name
            }
        }
    }
})();