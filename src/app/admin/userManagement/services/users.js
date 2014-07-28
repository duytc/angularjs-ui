angular.module('tagcade.admin.userManagement')

    .factory('Users', function (AdminRestangular) {
        return AdminRestangular.service('users');
    })

;