(function () {
    'use strict';

    angular.module('tagcade.blocks.event')
        .directive('stopEvent', stopEvent)
    ;

    function stopEvent() {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                element.bind('click', function (e) {
                    e.stopPropagation();
                });
            }
        };
    }
})();