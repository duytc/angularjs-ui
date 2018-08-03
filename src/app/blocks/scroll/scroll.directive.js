(function () {
    'use strict';

    angular.module('tagcade.blocks.scroll')
        .directive('scroll', scroll)
    ;

    function scroll() {
        return function(scope, elm, attr) {
            //for ist-multiselect
            var elmContainer = elm.find('.checkBoxContainer') ? elm.find('.checkBoxContainer') : elm;

            var raw = elmContainer ? elmContainer[0] : elm[0];
            elmContainer.bind('scroll', function() {
                if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight) {
                    scope.$apply(attr.scroll);
                }
            });
        };
    }
})();