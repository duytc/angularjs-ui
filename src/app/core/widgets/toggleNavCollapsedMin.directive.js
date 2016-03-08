(function () {
    'use strict';

    angular.module('tagcade.core.widgets')
        .directive('toggleNavCollapsedMin', toggleNavCollapsedMin)
    ;

    function toggleNavCollapsedMin($rootScope) {
        return {
            restrict: 'A',
            link: function (scope, ele) {
                var app;
                app = $('#app');
                return ele.on('click', function (e) {
                    if (app.hasClass('nav-collapsed-min')) {
                        app.removeClass('nav-collapsed-min');
                    } else {
                        app.addClass('nav-collapsed-min');
                        $rootScope.$broadcast('nav:reset');
                    }

                    ////
                    if($('#app').hasClass('on-canvas')) {
                        $('#app').removeClass('on-canvas')
                    }

                    if (!$('#sidebar').is(':visible')) {
                        $("#sidebar").toggleClass("hide");
                    }

                    $("#sidebar").toggleClass("menu-compact");

                    var isCompact = $("#sidebar").hasClass("menu-compact");
                    if (isCompact) {
                        $(".open > .submenu").removeClass("open");
                    }
                    ////

                    return e.preventDefault();
                });
            }
        };
    }
})();