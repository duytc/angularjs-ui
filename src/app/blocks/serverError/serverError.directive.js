(function () {
    'use strict';

    angular.module('tagcade.blocks.serverError')
        .directive('serverError', serverError)
    ;

    function serverError() {
        // simple directive, if the server validity is ever set to false
        // as soon as the user changes the text, make it valid again
        // so they may re-submit

        return {
            restrict: 'A',
            require: '?ngModel',
            link: function(scope, element, attrs, ctrl) {
                element.on('change', function () {
                    scope.$apply(function () {
                        ctrl.$setValidity('server', true);
                    })
                })
            }
        };
    }
})();