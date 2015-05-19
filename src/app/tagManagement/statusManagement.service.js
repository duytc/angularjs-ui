(function() {
    'use strict';

    angular.module('tagcade.tagManagement')
        .factory('statusManagementService', statusManagementService)
        .constant('kEY_STATUS', {
            currentPage: 'currentPage'
        })
    ;

    function statusManagementService(kEY_STATUS) {
        var api = {
            getCurrentConfigForAdSlot: getCurrentConfigForAdSlot,
            setCurrentPageForAdSlot: setCurrentPageForAdSlot,

            getCurrentConfigForSite: getCurrentConfigForSite,
            setCurrentPageForSite: setCurrentPageForSite
        };

        var _currentConfigForAdSlot = [];
        var _currentConfigForSite = [];

        var listStatusSupportAdSlot = [kEY_STATUS.currentPage];
        var listStatusSupportSite = [kEY_STATUS.currentPage];

        return api;

        ///////////


        function setCurrentPageForAdSlot(currentPage) {
            _setCurrentConfigForAdSlot(kEY_STATUS.currentPage, currentPage);
        }

        function setCurrentPageForSite(currentPage) {
            _setCurrentConfigForSite(kEY_STATUS.currentPage, currentPage);
        }

        /////////////////////////////

        function _setCurrentConfigForAdSlot(key, currentValue) {
            var found = false;
            var supportedKey;

            for(var index in listStatusSupportAdSlot) {
                supportedKey = listStatusSupportAdSlot[index];
                if(key == supportedKey && !found) {
                    _currentConfigForAdSlot[key] = currentValue;
                    found = true;

                    break;
                }
            }

            if(!found) {
                console.log('not support key "'+ key +'"');
            }
        }

        function getCurrentConfigForAdSlot() {
            return _currentConfigForAdSlot;
        }

        function _setCurrentConfigForSite(key, currentValue) {
            var found = false;
            var supportedKey;

            for(var index in listStatusSupportSite) {
                supportedKey = listStatusSupportSite[index];
                if(key == supportedKey) {
                    _currentConfigForSite[key] = currentValue;
                    found = true;
                    break;
                }
            }

            if(!found) {
                console.log('not support key "'+ key +'"');
            }
        }

        function getCurrentConfigForSite() {
            return _currentConfigForSite;
        }
    }
})();