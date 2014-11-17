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
                    return e.preventDefault();
                });
            }
        };
    }
})();