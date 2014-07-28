angular.module('tagcade.admin.userManagement')

    .controller('AdminUserController', function ($scope, Users) {
        Users.getList().then(function (users) {
            $scope.users = users;
        });
    })

;