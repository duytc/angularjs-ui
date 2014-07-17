angular.module('tagcade.core', [
    'ui.router',

    'tagcade.core.ui',
    'tagcade.core.auth',
    'tagcade.core.myAccount'
])

    .constant('API_BASE_URL', 'http://api.tagcade.dev/app_dev.php/api/v1')
    .constant('ENTRY_STATE', 'login')
;