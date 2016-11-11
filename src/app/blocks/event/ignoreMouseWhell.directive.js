(function () {
    'use strict';

    angular.module('tagcade.blocks.event')
        .directive('input', ignoreMouseWheel)
    ;

    function ignoreMouseWheel() {
        return {
            restrict: 'ACE',
            link: function( scope, element, attrs ){
                element.bind('mousewheel', function ( event ) {
                    element.blur();
                } );
            }
        }
    }
})();