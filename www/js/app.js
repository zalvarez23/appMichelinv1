// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic',
                           'ngCordova',
                           'starter.controllers',
                           'starter.services',
                           'starter.session',
                           'starter.actividades',
                           'starter.tareas',
                           'starter.gps'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required      
      StatusBar.show();
      StatusBar.overlaysWebView(false);
      StatusBar.styleLightContent();
      StatusBar.backgroundColorByHexString("#54b4eb");
    }
  });
})
.constant("wepapi", "http://vmwaresis.com.pe/movil/Controladores/")
//.constant("wepapi", "http://www.blackpublicidad.com/Controladores/")

.config(function($stateProvider, $urlRouterProvider,$httpProvider,$ionicConfigProvider) {
  $ionicConfigProvider.tabs.position('bottom');    
  $ionicConfigProvider.backButton.text('');
  $ionicConfigProvider.backButton.previousTitleText(false);
  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.inicio', {
    url: '/inicio',
    cache: false,
    views: {
      'tab-inicio': {
        templateUrl: 'templates/ProgramacionT/tab-inicio.html',
        controller: 'InicioCtrl'
      }
    }
  })

  .state('tab.inicio-tareas', {
    url: '/tareas/:idActividad',
    views: {
      'tab-inicio': {
        templateUrl: 'templates/ProgramacionT/tab-inicio-tareas.html',
        controller: 'InicioTareasCtrl'
      }
    }
  })

  .state('login',{
    url: '/login',
    templateUrl: 'templates/InicioSesion/login.html',
    controller: 'loginCtrl'
  })
  .state('tab.historial', {
      url: '/historial',
      cache : false,
      views: {
        'tab-historial': {
          templateUrl: 'templates/Historial/tab-historial.html',
          controller: 'HistorialCtrl'
        }
      }
    })
  .state('tab.historial-tareas', {
      url: '/historialTareas/:idActividad',
      cache : false,
      views: {
        'tab-historial': {
          templateUrl: 'templates/Historial/tab-historial-tareas.html',
          controller: 'HistorialTareasCtrl'
        }
      }
    })
  .state('tab.chat-detail', {
      url: '/chats/:chatId',
      views: {
        'tab-chats': {
          templateUrl: 'templates/chat-detail.html',
          controller: 'ChatDetailCtrl'
        }
      }
    })

  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');

});
