angular.module('app', ['ngRoute'])
	.config(function ($routeProvider, $httpProvider, $locationProvider) {
		
		$httpProvider.interceptors.push('authenticationInterceptor');

		$routeProvider
			.when('/', {
				templateUrl: 'home.html',
				controller: 'HomePageController',
				resolve: {
					repos: function(ghRepos) {
						return ghRepos();
					}
				}
			})
			.when('/login', {
				templateUrl: 'login.html',
				controller: 'LoginController'
			})
			.when('/logout', {
				controller: 'LogoutCtrl',
				template: ''
			})
			.otherwise({
				redirectTo: '/'
			})
	})
	.factory('ghRepos', function ($http) {
		return function() {
			return $http.get('https://api.github.com/repositories');
		}
	})
	.factory('userSession', function () {
		return {
			loggedIn: false
		}
	})	
	.factory('authenticationInterceptor', function (userSession, $location) {
		return {
			request: function (request) {
				if(!userSession.loggedIn && request.url.match('api')) {
					var previousPage = $location.path();
					$location.path('/login').search({ 
						previous : previousPage 
					});
				} 
				return request;
			}
		}
	})	
	.controller('LogoutCtrl', function($location, userSession) {
		userSession.loggedIn = false;
		$location.path('/login');
	})
	.controller('HeaderCtrl', function (userSession, $scope, $location) {
		$scope.loggedIn = userSession.loggedIn;

		$scope.$on('loginSuccess', function() {
			$scope.loggedIn = userSession.loggedIn;			
		})

		$scope.logIn = function() {
			$location.path('/login');			
		}

		$scope.logOut = function() {
			$scope.loggedIn = false;
			$location.path('/logout');
		}
	})
	.controller('HomePageController', function ($scope, repos) {
		$scope.repos = repos.data;
	})
	.controller('LoginController', function ($rootScope, $scope, userSession, $location) {
		var ctrl = this;
		ctrl.previousPage = $location.search().previous;
		ctrl.login = function(u, p) {
			$location.badLogin = false;

			if(u === 'u' && p === 'p') {
				userSession.loggedIn = true;
				$location.path(ctrl.previousPage || '/');
				$location.search({});
				$rootScope.$broadcast('loginSuccess');
			} else if (u && p) {
				$scope.badLogin = true;
			} else if (!u && !p) {
				$scope.omittedUsername = true;
				$scope.omittedPassword = true;
			} else if (!u) {
				$scope.omittedUsername = true;
			} else {
				$scope.omittedPassword = true;				
			}
		}
	})





