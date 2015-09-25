require('angular');

export default {
  'generator': angular.module('generator', [])
    .directive('generator', require('./directives/generator/directive'))
};