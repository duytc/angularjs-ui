(function () {
    'use strict';

    angular.module('tagcade.core.layout')
        .controller('AppController', App)
    ;

    function App($scope, Auth, userSession, USER_MODULES) {
        $scope.currentUser = userSession;

        $scope.hasDisplayAdsModule = userSession.hasModuleEnabled(USER_MODULES.displayAds);
        $scope.hasAnalyticsModule = userSession.hasModuleEnabled(USER_MODULES.analytics);
        $scope.hasUnifiedModule = userSession.hasModuleEnabled(USER_MODULES.unified);

        $scope.isAdmin = Auth.isAdmin;

        $scope.admin = {
            layout: 'wide',
            menu: 'vertical',
            fixedHeader: true,
            fixedSidebar: true
        };
    }
})();