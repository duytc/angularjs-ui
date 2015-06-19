(function () {
    'use strict';

    angular.module('tagcade.core.widgets')
        .directive('selectOnClick', selectOnClick)
    ;

    function selectOnClick() {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.on('click', function () {
                    if (this.tagName == 'TEXTAREA' || this.tagName == 'INPUT') {
                        this.select();
                    }
                    else {
                        if (document.selection) {
                            var range = document.body.createTextRange();
                            range.moveToElementText(this);
                            range.select();
                        } else if (window.getSelection()) {
                            var range = document.createRange();
                            range.selectNode(this);
                            window.getSelection().removeAllRanges();
                            window.getSelection().addRange(range);
                        }
                    }
                });
            }
        };
    }
})();