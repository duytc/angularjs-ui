exports.config = {
    seleniumAddress: 'http://localhost:4444/wd/hub',
    baseUrl: 'http://localhost:9010/',
    capabilities: {
        'browserName': 'chrome'
    },

    specs: ['e2e/login.js', 'e2e/admin/publisher.management.spec.js', 'e2e/admin/tagManagement/*spec.js', 'e2e/*spec.js', 'e2e/admin/reports/*.spec.js'],
    params: {
        login: {
            username: 'admin',
            password: 'admin'
        },
        role: '#/adm',
        edit: {
            publisherId: 14,
            adNetworkId : 1,
            siteId: 2,
            adSlotId: 1,
            adTagId: 2
        }
    },

    jasmineNodeOpts: {
        showColors: true,
        defaultTimeoutInterval: 1000000
    },

    allScriptsTimeout:1000000
};