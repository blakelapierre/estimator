require('angular');
require('angular-animate');
require('angular-route');

import contenteditable from '../contenteditable';
import generator from '../generator';

module.exports = {
  'contenteditable': contenteditable['contenteditable'],
  'estimator': angular.module('estimator', ['ngAnimate', 'ngRoute', 'contenteditable', 'generator'])
    .directive('calendar',       require('./directives/calendar/directive'))
      .directive('listView',       require('./directives/calendar/listView/directive'))
    .directive('estimator',      require('./directives/estimator/directive'))
    .directive('task',      require('./directives/task/directive'))
    .directive('taskInput',      require('./directives/taskInput/directive'))

    .factory('tasksStore',       require('./factories/tasksStore/factory'))
    .factory('parser',           require('./factories/parser/factory'))

    .config(['$routeProvider', $routeProvider => {

      $routeProvider
        .when('/', {
          template: '<estimator></estimator>'
        })
        .when('/calendar', {
          template: '<calendar></calendar>'
        })
        .otherwise({
          template: 'Where\'d you come from?'
        });
    }])
};