var app = angular.module('growlingRabbit', ['ui.router']);
app.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

  $stateProvider
      .state('home', {
        url: '/home',
        templateUrl: '/home.html'
      })

       .state('menu', {
    	 url: '/menu',
    	 templateUrl: '/menu.html'
	   })

       .state('contact', {
       url: '/contact',
       templateUrl: '/contact.html'
     })

      .state('admin', {
       url: '/admin',
       templateUrl: '/admin.html'
     });

  $urlRouterProvider.otherwise('home');
}]);

// app.controller('MainCtrl');