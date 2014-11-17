window.deferredBootstrapper.bootstrap({
    element: document,
    module: 'tagcade',
    injectorModules: ['tagcade.core.bootstrap', 'tagcade.core.auth'],
    moduleResolves: [
        {
            module: 'tagcade.core.bootstrap',
            resolve: {
                EXISTING_SESSION: ['Auth', function (Auth) {
                    return Auth.check().catch(function () {
                        return false;
                    }).finally(function () {
                        console.log('auth resolved');
                    });
                }]
            }
        }
    ]
});