exports.config = {
    seleniumAddress: 'http://localhost:4444/wd/hub',
    baseUrl: 'http://localhost:9010/',
    capabilities: {
        'browserName': 'chrome'
    },

    specs: ['e2e/login.js', 'e2e/publisher/tagManagement/*spec.js', 'e2e/*spec.js', 'e2e/publisher/reports/*.spec.js', 'e2e/publisher/supportTools/*.spec.js'],

    params: {
        login: {
            username: 'mypub',
            password: '123455'
        },
        role: '#/pub',
        edit: {
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