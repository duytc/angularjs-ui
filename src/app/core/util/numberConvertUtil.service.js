(function() {
    'use strict';

    angular.module('tagcade.core.util')
        .factory('NumberConvertUtil', NumberConvertUtil)
    ;

    function NumberConvertUtil() {
        return {
            convertPriceToString: convertPriceToString
        };

        function convertPriceToString(price, toFixed) {
            var toFixed = toFixed || 2;

            if(!price && price != 0) {
                return null;
            }

            price = Number(price);

            return price.toFixed(toFixed).toString()
        }
    }
})();