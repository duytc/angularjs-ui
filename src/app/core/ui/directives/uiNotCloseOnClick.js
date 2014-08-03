angular.module('tagcade.core.ui')
    .directive('uiNotCloseOnClick', [
        function () {
            return {
                restrict: 'A',
                compile: function (ele, attrs) {
                    return ele.on('click', function (event) {
                        return event.stopPropagation();
                    });
                }
            };
        }
    ])
;