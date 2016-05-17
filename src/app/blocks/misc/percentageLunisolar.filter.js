(function () {
    'use strict';

    angular.module('tagcade.blocks.misc')
        .filter('percentageLunisolar', percentageLunisolar)
    ;

    function percentageLunisolar($window) {
        return function (input, decimals, suffix) {
            decimals = angular.isNumber(decimals) ? decimals : 2;
            suffix = suffix || '%';

            if ($window.isNaN(input)) {
                return '';
            }

            var char = input > 0 ? '+' : '';

            return char + Math.round(input * Math.pow(10, decimals + 2))/Math.pow(10, decimals) + suffix
        };
    }
})();