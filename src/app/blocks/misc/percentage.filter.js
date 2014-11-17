(function () {
    'use strict';

    angular.module('tagcade.blocks.misc')
        .filter('percentage', percentage)
    ;

    function percentage($window) {
        return function (input, decimals, suffix) {
            decimals = angular.isNumber(decimals) ? decimals : 2;
            suffix = suffix || '%';

            if ($window.isNaN(input)) {
                return '';
            }

            return Math.round(input * Math.pow(10, decimals + 2))/Math.pow(10, decimals) + suffix
        };
    }
})();