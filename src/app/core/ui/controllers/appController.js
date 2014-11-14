angular.module('tagcade.core.ui')

    .controller('AppController', function($rootScope, $scope, $state, userSession, USER_MODULES) {
        'use strict';

        $scope.currentUser = userSession;

        $scope.hasDisplayAdsModule = userSession.hasModuleEnabled(USER_MODULES.displayAds);
        $scope.hasAnalyticsModule = userSession.hasModuleEnabled(USER_MODULES.analytics);

        $scope.admin = {
            layout: 'wide',
            menu: 'vertical',
            fixedHeader: true,
            fixedSidebar: false
        };

        $scope.$watch('admin', function (newVal, oldVal) {
            if (newVal.menu === 'horizontal' && oldVal.menu === 'vertical') {
                $rootScope.$broadcast('nav:reset');
                return;
            }
            if (newVal.fixedHeader === false && newVal.fixedSidebar === true) {
                if (oldVal.fixedHeader === false && oldVal.fixedSidebar === false) {
                    $scope.admin.fixedHeader = true;
                    $scope.admin.fixedSidebar = true;
                }
                if (oldVal.fixedHeader === true && oldVal.fixedSidebar === true) {
                    $scope.admin.fixedHeader = false;
                    $scope.admin.fixedSidebar = false;
                }
                return;
            }
            if (newVal.fixedSidebar === true) {
                $scope.admin.fixedHeader = true;
            }
            if (newVal.fixedHeader === false) {
                $scope.admin.fixedSidebar = false;
            }
        }, true);
    })

;