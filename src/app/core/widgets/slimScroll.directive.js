(function () {
    'use strict';

    angular.module('tagcade.core.widgets')
        .directive('slimScroll', slimScroll)
    ;

    function slimScroll() {
        return {
            restrict: 'A',
            link: function(scope, ele, attrs) {
                var app = $('#app');

                $('.toggle-min').bind('click', function() {
                    if(app.hasClass('nav-collapsed-min')) {
                        ele.slimScroll({destroy: true});
                        ele.css({width: '224px', overflow: 'visible'})
                    } else {
                        ele.slimScroll({
                            height: attrs.scrollHeight || '100%',
                            width: '224px',
                            position: 'right'
                        })
                    }
                });

                ele.slimScroll({
                    height: attrs.scrollHeight || '100%',
                    width: '224px',
                    position: 'right'
                })
            }
        }
    }
})();