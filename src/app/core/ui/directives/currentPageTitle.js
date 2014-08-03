angular.module('tagcade.core.ui')
    .directive('currentPageTitle', function($state) {
        return {
            link: function(scope, element) {
                try {
                    var title = $state.$current.breadcrumb.title;
                } catch(e) {}

                if (angular.isDefined(title) && angular.isString(title)) {
                    element.text(title);
                }
            }
        }
    })
;