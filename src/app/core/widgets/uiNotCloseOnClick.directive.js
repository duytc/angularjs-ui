(function () {
    'use strict';

    angular.module('tagcade.core.widgets')
        .directive('uiNotCloseOnClick', uiNotCloseOnClick)
    ;

    function uiNotCloseOnClick() {
        return {
            restrict: 'A',
            compile: function (ele) {
                return ele.on('click', function (event) {
                    return event.stopPropagation();
                });
            }
        };
    }
})();