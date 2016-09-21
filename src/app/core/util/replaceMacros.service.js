(function() {
    'use strict';

    angular.module('tagcade.core.util')
        .factory('ReplaceMacros', ReplaceMacros)
    ;

    function ReplaceMacros($q, $modal, VIDEO_MACROS_REFERENCE) {
        var $_url;

        return {
            replaceVideoMacros : function(tagUrl) {
                var deferred = $q.defer();

                angular.forEach(VIDEO_MACROS_REFERENCE, function(videoMacros, key) {
                    var pattern = new RegExp(key);

                    if(pattern.test(tagUrl)) {

                        var modalInstance = $modal.open({
                            templateUrl: 'videoLibrary/demandAdTag/confirmReplaceMacros.tpl.html'
                        });

                        modalInstance.result.then(function () {
                            angular.forEach(videoMacros, function(value, key) {
                                    if(tagUrl.indexOf(key) > -1) {
                                        key = '=' + key ;
                                        value = '=' + value;

                                        $_url = tagUrl.replace(key, value);
                                        tagUrl = $_url;

                                        deferred.resolve($_url);
                                    }
                                }
                            );
                        });
                    }
                });

                return deferred.promise;
            },

            getVideoUrl: function () {
                return $_url;
            }
        }
    }
})();