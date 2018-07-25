(function () {
    'use strict';

    angular.module('tagcade.blocks.scroll')
        .directive('scroll', scroll)
    ;

    function scroll() {
        return function(scope, elm, attr) {
            var raw = elm[0];

            elm.bind('scroll', function() {
                if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight) {
                    scope.$apply(attr.scroll);
                }
            });
        };
    }
})();