var app = angular.module('falafelManager', ['ngRoute', 'ui.bootstrap', 'kendo.directives', 'firebase']);

app.constant('FIREBASE_URI', 'https://falafel-manager.firebaseio.com/');

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

app.controller('DashboardCtrl', function ($scope, FalafelKioskService) {
    $scope.falafelKiosks = FalafelKioskService.getFalafelKiosks();
});

app.controller('ManagerCtrl', function ($scope, FalafelKioskService) {
    $scope.currentFalafelKiosk = null;
    $scope.newFalafelKiosk = { name: '', status: '' };
    $scope.falafelKiosks = FalafelKioskService.getFalafelKiosks();

    $scope.setCurrentFalafelKiosk = function (id, falafelKiosk) {
        falafelKiosk.id = id;
        $scope.currentFalafelKiosk = falafelKiosk ;
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

app.factory('FalafelKioskService', function ($firebase, FIREBASE_URI) {
    var ref = new Firebase(FIREBASE_URI + 'kiosks');
    var falafelKiosks = $firebase(ref);

    var getFalafelKiosks = function () {
        return falafelKiosks;
    };

    var addFalafelKiosk = function (kiosk) {
        falafelKiosks.$add(kiosk)
    };

    var updateFalafelKiosk = function (id) {
        falafelKiosks.$save(id);
    };

    var removeFalafelKiosk = function (id) {
        falafelKiosks.$remove(id);
    };

    return {
        getFalafelKiosks: getFalafelKiosks,
        addFalafelKiosk: addFalafelKiosk,
        updateFalafelKiosk: updateFalafelKiosk,
        removeFalafelKiosk: removeFalafelKiosk
    }
});

app.factory('AuthService', function ($rootScope, $firebaseSimpleLogin, FIREBASE_URI) {
    var currentUser = null;
    var loginService = $firebaseSimpleLogin(new Firebase(FIREBASE_URI));

    var getCurrentUser = function () {
        return currentUser || loginService.$getCurrentUser();
    };

    var login = function (email, password) {
        loginService.$login('password', { email: email, password: password });
    };

    var logout = function () {
        loginService.$logout();
    };

    var register = function (email, password) {
        loginService.$createUser(email, password);
    };

    $rootScope.$on('$firebaseSimpleLogin:login', function (e, user) {
        currentUser = user;
        $rootScope.$broadcast('onLogin');
    });

    $rootScope.$on('$firebaseSimpleLogin:logout', function (e) {
        currentUser = null;
        $rootScope.$broadcast('onLogout');
    });

    $rootScope.$on('$firebaseSimpleLogin:error', function (e, err) {
        currentUser = null;
        $rootScope.$broadcast('onLogout');
    });

    return {
        getCurrentUser: getCurrentUser,
        login: login,
        logout: logout,
        register: register
    }
});