(function () {
    'use strict';

    angular.module('tagcade.core.widgets')
        .directive('toggleOffCanvas', toggleOffCanvas)
    ;

    function toggleOffCanvas() {
        'use strict';

        return {
            restrict: 'A',
            link: function (scope, ele) {
                return ele.on('click', function () {
                    if (!$("#sidebar").hasClass("hide")) {
                        $("#sidebar").toggleClass("hide");
                        $('#app').toggleClass('on-canvas');
                    } else {
                        $("#sidebar").removeClass("hide");
                        $('#app').removeClass('on-canvas');
                    }

                    if ($("#sidebar").hasClass("menu-compact")) {
                        $("#sidebar").removeClass("menu-compact");
                    }

                    if ($("#app").hasClass("nav-collapsed-min")) {
                        $("#app").removeClass("nav-collapsed-min");
                    }
                });
            }
        };
    }
})();