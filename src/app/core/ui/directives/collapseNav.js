angular.module('tagcade.core.ui')
    .directive('collapseNav', function () {
        'use strict';

        return {
            restrict: 'A',
            link: function (scope, ele) {
                var $a, $aRest, $app, $lists, $listsRest, $nav, $window, Timer, prevWidth, updateClass;

                $window = $(window);
                $lists = ele.find('ul').parent('li');
                $lists.append('<i class="fa fa-caret-down icon-has-ul-h"></i><i class="fa fa-caret-right icon-has-ul"></i>');
                $a = $lists.children('a');
                $listsRest = ele.children('li').not($lists);
                $aRest = $listsRest.children('a');
                $app = $('#app');
                $nav = $('#nav-container');

                $a.on('click', function (event) {
                    var $parent, $this;

                    if ($app.hasClass('nav-collapsed-min') || ($nav.hasClass('nav-horizontal') && $window.width() >= 768)) {
                        return false;
                    }

                    $this = $(this);
                    $parent = $this.parent('li');
                    $lists.not($parent).removeClass('open').find('ul').slideUp();
                    $parent.toggleClass('open').find('ul').slideToggle();

                    return event.preventDefault();
                });

                $aRest.on('click', function () {
                    return $lists.removeClass('open').find('ul').slideUp();
                });

                scope.$on('nav:reset', function () {
                    return $lists.removeClass('open').find('ul').slideUp();
                });

                Timer = void 0;
                prevWidth = $window.width();

                updateClass = function () {
                    var currentWidth;

                    currentWidth = $window.width();

                    if (currentWidth < 768) {
                        $app.removeClass('nav-collapsed-min');
                    }

                    if (prevWidth < 768 && currentWidth >= 768 && $nav.hasClass('nav-horizontal')) {
                        $lists.removeClass('open').find('ul').slideUp();
                    }

                    prevWidth = currentWidth;

                    return currentWidth;
                };

                return $window.resize(function () {
                    var t;

                    clearTimeout(t);
                    t = setTimeout(updateClass, 300);

                    return t;
                });
            }
        };
    })
;