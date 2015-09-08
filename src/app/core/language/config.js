(function () {
    'use strict';

    angular.module('tagcade.core.language')
        .config(configTranslate);

    function configTranslate($translateProvider, LOCALE_EN) {
        $translateProvider
            .translations('en', LOCALE_EN)
        ;

        $translateProvider
            .preferredLanguage('en')
            .useSanitizeValueStrategy('escaped');
    }
})();