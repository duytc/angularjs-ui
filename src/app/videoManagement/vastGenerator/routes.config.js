(function() {
    'use strict';

    angular.module('tagcade.videoManagement.vastGenerator')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        UserStateHelperProvider
            .state('videoManagement.vastGenerator', {
                url: '/generateVasts?videoPublisherId',
                views: {
                    'content@app': {
                        controller: 'VastGenerator',
                        templateUrl: 'videoManagement/vastGenerator/vastGenerator.tpl.html'
                    }
                },
                resolve: {
                    videoPublishers: function(VideoPublisherManager) {
                        return VideoPublisherManager.getList();
                    },
                    videoPublisher: /* @ngInject */ function ($stateParams, VideoPublisherManager) {
                        var videoPublisherId = $stateParams.videoPublisherId;

                        if (!videoPublisherId) {
                            return null;
                        }

                        return VideoPublisherManager.one(videoPublisherId).get();
                    },
                    vastTags: function( videoPublisher) {
                        if (!videoPublisher) {
                            return null;
                        }

                        return videoPublisher.customGET('vasttags', {secure: true})
                            .then(function(vastTags) {
                                return vastTags.plain()
                            });
                    }
                },
                customResolve: {
                    admin: {
                        publishers: /* @ngInject */ function(adminUserManager) {
                            return adminUserManager.getList({ filter: 'publisher' }).then(function (users) {
                                return users.plain();
                            });
                        }
                    }
                },
                ncyBreadcrumb: {
                    label: 'Generate Vast Tags'
                },
                reloadOnSearch: false
            })
        ;
    }
})();