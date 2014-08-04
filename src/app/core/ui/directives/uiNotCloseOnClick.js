angular.module('tagcade.core.ui')

    .directive('uiNotCloseOnClick', function () {
        'use strict';

        return {
            restrict: 'A',
            compile: function (ele) {
                return ele.on('click', function (event) {
                    return event.stopPropagation();
                });
            }
        };
    })

;