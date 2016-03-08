(function () {
    'use strict';

    angular.module('tagcade.core.widgets')
        .directive('slimScroll', slimScroll)
    ;

    function slimScroll() {
        return {
            restrict: 'A',
            link: function(scope, ele, attrs) {
                ele.slimScroll({
                    height: attrs.scrollHeight || '100%',
                    width: '224px',
                    position: 'right',
                    size: '3px'
                })
            }
        }
    }
})();