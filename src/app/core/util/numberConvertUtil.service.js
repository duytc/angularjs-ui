(function () {
    'use strict';

    angular.module('tagcade.core.util')
        .factory('NumberConvertUtil', NumberConvertUtil)
    ;

    function NumberConvertUtil() {
        return {
            convertPriceToString: convertPriceToString,
            subtractArray: subtractArray,
            compareById: compareById
        };

        function convertPriceToString(price, toFixed) {
            var toFixed = toFixed || 2;

            if (price == null) {
                return null;
            }

            price = Number(price);

            return price.toFixed(toFixed).toString()
        }

        /**
         *
         * @param bigger all sites
         * @param smaller some sites
         * @returns {Array} sites that's not selected
         */
        function subtractArray(bigger, smaller) {
            var temp = [];
            for (var i in bigger) {
                if (smaller.indexOf(bigger[i].id) === -1)
                    temp.push(bigger[i]);
            }
            return temp;
        }

        /**
         * compare to sort
         * @param a site a
         * @param b site b
         * @returns {number}
         */
        function compareById(a,b) {
            if (a.id < b.id)
                return -1;
            if (a.id > b.id)
                return 1;
            return 0;
        }
    }
})();