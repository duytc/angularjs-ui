(function() {
    'use strict';

    angular.module('tagcade.supportTools.sourceReportConfiguration')
        .factory('sourceReportConfig', sourceReportConfig)
    ;

    function sourceReportConfig(adminRestangular, adminUserManager, USER_MODULES) {
        var api = {
            getPublishers: getPublishers,
            getSiteByPublisher: getSiteByPublisher,
            getSourceReportHasConfig: getSourceReportHasConfig,
            getSitesNoConfig: getSitesNoConfig,
            postSiteForEmail: postSiteForEmail,
            postEmailConfig: postEmailConfig,
            deleteEmailConfig: deleteEmailConfig,
            deleteSiteConfig: deleteSiteConfig,
            postEmailIncludedAllConfig: postEmailIncludedAllConfig,
            updateEmailConfig: updateEmailConfig,
            getAllSourceConfig: getAllSourceConfig
        };

        return api;

        function getPublishers() {
            return adminUserManager.getList({ filter: 'publisher' }).then(function (users) {
                var usersEnabledDisplay = [];

                angular.forEach(users.plain(), function(user) {
                    if(user.enabledModules.indexOf(USER_MODULES.analytics) > -1) {
                        usersEnabledDisplay.push(user);
                    }
                });

                return usersEnabledDisplay;
            });
        }

        function getSiteByPublisher(publisherId) {
            return adminUserManager.one(publisherId).getList('sites', {enableSourceReport: true})
                .then(function (sites) {
                    return sites.plain();
                });
        }

        function getSourceReportHasConfig(emailId) {
            return adminRestangular.one('sourcereportemailconfigs', emailId).get()
                .then(function(site) {
                    return site.plain();
                });
        }

        function getSitesNoConfig(sitesConfigSucceed, sites) {
            var sitesNoConfig = [];
            var sitesConfigId = [];

            angular.forEach(sites, function(site) {
                angular.forEach(sitesConfigSucceed, function(siteHasConfig) {

                    if(site.id == siteHasConfig.id){
                        return sitesConfigId.push(site.id);
                    }
                });

                if(sitesConfigId.indexOf(site.id) == -1) {
                    sitesNoConfig.push(site);
                }
            });

            return sitesNoConfig;
        }

        function postSiteForEmail(emailId, sites) {
            return adminRestangular.one('sourcereportsiteconfigs').one('emails', emailId).customPOST({sites: sites});
        }

        function postEmailConfig(emails, sites) {
            return adminRestangular.one('sourcereportemailconfigs').customPOST({emails: emails, sites: sites});
        }

        function postEmailIncludedAllConfig(emails, includedAll) {
            return adminRestangular.one('sourcereportemailconfigs','emailIncludedAll').customPOST({emails: emails, includedAll: includedAll, active: true});
        }

        function deleteEmailConfig(emailId) {
            return adminRestangular.one('sourcereportemailconfigs', emailId).customDELETE();
        }

        function deleteSiteConfig(siteId) {
            return adminRestangular.one('sourcereportsiteconfigs', siteId).customDELETE();
        }

        function updateEmailConfig(emailReceive) {
            var params = {
                id: emailReceive.id,
                active: emailReceive.active,
                email: emailReceive.email,
                includedAll: emailReceive.includedAll
            };

            return adminRestangular.one('sourcereportemailconfigs', params.id).customPUT(params)
        }

        function getAllSourceConfig() {
            return adminRestangular.one('sourcereportemailconfigs').get();
        }
    }
})();
