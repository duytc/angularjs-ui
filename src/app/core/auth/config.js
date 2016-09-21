(function () {
    'use strict';

    angular.module('tagcade.core.auth')
        .constant('AUTH_TOKEN_NAME', 'tagcadeToken')
        .constant('PREVIOUS_AUTH_TOKEN_NAME', 'tagcadePreviousAuthTokenRaw')
        .constant('CURRENT_PUBLISHER_SETTINGS', 'tagcadeCurrentPublisherSettings')

        .constant('USER_ROLES', {
            admin: 'ROLE_ADMIN',
            publisher: 'ROLE_PUBLISHER',
            subPublisher: 'ROLE_SUB_PUBLISHER'
        })

        .constant('USER_MODULES', {
            displayAds: 'MODULE_DISPLAY',
            videoAds: 'MODULE_VIDEO',
            video: 'MODULE_VIDEO_ANALYTICS',
            analytics: 'MODULE_ANALYTICS',
            source: 'MODULE_SOURCE_REPORT',
            unified: 'MODULE_UNIFIED_REPORT',
            subPublisher: 'MODULE_SUB_PUBLISHER',
            rtb: 'MODULE_RTB',
            headerBidding: 'MODULE_HEADER_BIDDING'
        })

        .constant('AUTH_EVENTS', {
            loginSuccess: 'tagcade.core.auth.login_success',
            loginFailed: 'tagcade.core.auth.login_failed',
            logoutSuccess: 'tagcade.core.auth.logout_success',
            sessionTimeout: 'tagcade.core.auth.session_timeout',
            notAuthenticated: 'tagcade.core.auth.not_authenticated',
            notAuthorized: 'tagcade.core.auth.not_authorized'
        })

    ;

})();