(function () {
    'use strict';

    angular.module('tagcade.blocks.ignoreMouseWhell')
        .directive('ignoreMouseWheel', ignoreMouseWheel)
    ;

    function ignoreMouseWheel() {
        return {
            restrict: 'A',
            link: function( scope, element, attrs ){
                element.bind('mousewheel', function ( event ) {
                    console.log('Test ');
                    element.blur();
                } );
            }
        }
    }
})();