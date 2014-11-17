(function () {
    'use strict';

    angular.module('tagcade.core.widgets')
        .directive('selectOnClick', selectOnClick)
    ;

    function selectOnClick() {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.on('click', function () {
                    this.select();
                });
            }
        };
    }
})();