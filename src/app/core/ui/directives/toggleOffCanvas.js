angular.module('tagcade.core.ui')
    .directive('toggleOffCanvas', function () {
        'use strict';

        return {
            restrict: 'A',
            link: function (scope, ele) {
                return ele.on('click', function () {
                    return $('#app').toggleClass('on-canvas');
                });
            }
        };
    })
;