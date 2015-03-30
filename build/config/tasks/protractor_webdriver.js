module.exports = {

    options: {
        path: '<%= userConfig.seleniumPath %>',
        command: 'selenium-standalone start'
    },

    alive: {
        options: {
            keepAlive: false
        }
    },

    dead: {}
};

