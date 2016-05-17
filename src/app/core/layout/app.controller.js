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
        $scope.hasSubPublisherModule = userSession.hasModuleEnabled(USER_MODULES.subPublisher);
        $scope.hasVideoModule = userSession.hasModuleEnabled(USER_MODULES.video);
        $scope.hasRtbModule = userSession.hasModuleEnabled(USER_MODULES.rtb);
        $scope.hasHeaderBidding = userSession.hasModuleEnabled(USER_MODULES.headerBidding);

        $scope.isAdmin = Auth.isAdmin;
        $scope.isSubPublisher = Auth.isSubPublisher;

        $scope.admin = {
            layout: 'wide',
            menu: 'vertical',
            fixedHeader: true,
            fixedSidebar: true
        };
    }
})();