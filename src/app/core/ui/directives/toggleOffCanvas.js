angular.module('tagcade.core.ui')
    .directive('toggleOffCanvas', [
        function () {
            return {
                restrict: 'A',
                link: function (scope, ele, attrs) {
                    return ele.on('click', function () {
                        return $('#app').toggleClass('on-canvas');
                    });
                }
            };
        }
    ])
;