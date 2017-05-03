(function() {
    'use strict';

    angular.module('tagcade.core.data')
        .factory('dataService', dataService)
    ;

    function dataService(httpi) {
        var api = {
            makeHttpGetRequest: makeHttpGetRequest,
            makeHttpPOSTRequest: makeHttpPOSTRequest
        };

        return api;

        /////

        /**
         *
         * @param {String} url
         * @param {Object} params
         * @param {String} [basePath]
         * @returns {Promise}
         */
        function makeHttpGetRequest(url, params, basePath)
        {
            if (basePath) {
                url = basePath + url;
            }

            return httpi({
                method: 'get',
                url: url,
                params: params
            }).then(function(response) {
                return response.data;
            });
        }

        /**
         *
         * @param {String} url
         * @param {Object} params
         * @param {String} [basePath]
         * @returns {Promise}
         */
        function makeHttpPOSTRequest(url, params, basePath)
        {
            if (basePath) {
                url = basePath + url;
            }

            return httpi({
                method: 'post',
                url: url,
                data: params
            }).then(function(response) {
                return response.data;
            });
        }
    }
})();