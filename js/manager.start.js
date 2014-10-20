var app = angular.module('falafelManager', [
    'ngRoute',
    'ui.bootstrap',
    'kendo.directives'
]);

app.config(function ($routeProvider) {
    $routeProvider.
        when('/', {
            templateUrl: 'views/dashboard.html',
            controller: 'DashboardCtrl'
        }).
        when('/manager', {
            templateUrl: 'views/manager.html',
            controller: 'ManagerCtrl'
        }).
        when('/login', {templateUrl: 'views/login.html', controller: 'LoginCtrl'}).
        otherwise({redirectTo: '/'});
});

//-------------------------------------------------------------------------------------------------
// DEMO: Realtime
//-------------------------------------------------------------------------------------------------

app.controller('DashboardCtrl', function ($scope, FalafelKioskService) {
    $scope.falafelKiosks = FalafelKioskService.getFalafelKiosks();
});

app.controller('ManagerCtrl', function ($scope, FalafelKioskService) {
    $scope.currentFalafelKiosk = null;
    $scope.newFalafelKiosk = { name: '', status: '' };
    $scope.falafelKiosks = FalafelKioskService.getFalafelKiosks();

    $scope.setCurrentFalafelKiosk = function (id, falafelKiosk) {
        falafelKiosk.id = id;
        $scope.currentFalafelKiosk = falafelKiosk;
    };

    $scope.addFalafelKiosk = function () {
        FalafelKioskService.addFalafelKiosk(angular.copy($scope.newFalafelKiosk));
        $scope.resetForm();
    };

    $scope.updateFalafelKiosk = function (id) {
        FalafelKioskService.updateFalafelKiosk(id);
    };

    $scope.removeFalafelKiosk = function (id) {
        FalafelKioskService.removeFalafelKiosk(id);
    };

    $scope.resetForm = function () {
        $scope.currentFalafelKiosk = null;
        $scope.newFalafelKiosk = { name: '', status: '' };
    };
});

app.factory('FalafelKioskService', function () {
    var falafelKiosks = {
        1 : {
            'name' : 'Micahs Mega Falafel',
            'status' : '20'
        },
        2 : {
            'name' : 'Falafel King',
            'status' : '30'
        }
    };

    var getFalafelKiosks = function () {
        return falafelKiosks;
    };

    var addFalafelKiosk = function (kiosk) {
        var id = new Date().getTime();
        falafelKiosks[id] = kiosk;
    };

    var updateFalafelKiosk = function (id) {
        // Already in memory
    };

    var removeFalafelKiosk = function (id) {
        delete falafelKiosks[id];
    };

    return {
        getFalafelKiosks: getFalafelKiosks,
        addFalafelKiosk: addFalafelKiosk,
        updateFalafelKiosk: updateFalafelKiosk,
        removeFalafelKiosk: removeFalafelKiosk
    }
});

//-------------------------------------------------------------------------------------------------
// DEMO: Authentication
//-------------------------------------------------------------------------------------------------

app.controller('MainCtrl', function ($scope, $location, AuthService) {
    $scope.logout = function () {
        AuthService.logout();
    };

    $scope.$on('onLogin', function () {
        $scope.currentUser = AuthService.getCurrentUser();
        $location.path('/');
    });

    $scope.$on('onLogout', function () {
        $scope.currentUser = null;
        $location.path('/login');
    });

    $scope.currentUser = AuthService.getCurrentUser();
});

app.controller('LoginCtrl', function ($scope, $location, AuthService) {
    $scope.user = { email: '', password: '' };

    $scope.login = function (email, password) {
        AuthService.login(email, password);
    };

    $scope.register = function (email, password) {
        AuthService.register(email, password);
    };

    $scope.reset = function () {
        $scope.user = { email: '', password: '' };
    };
});

app.factory('AuthService', function ($rootScope) {
    var currentUser = { id:1, email: 'user@email.com' };

    var getCurrentUser = function () {
        return currentUser;
    };

    var login = function (email, password) {
        $rootScope.$broadcast('onLogin');
    };

    var logout = function () {
        $rootScope.$broadcast('onLogout');
    };

    var register = function (email, password) {
        $rootScope.$broadcast('onLogin');
    };

    return {
        getCurrentUser: getCurrentUser,
        login: login,
        logout: logout,
        register: register
    }
});