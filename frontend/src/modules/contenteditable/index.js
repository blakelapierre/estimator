require('angular');

module.exports = {
  'contenteditable': angular.module('contenteditable', [])
    .directive('contenteditable', require('./directives/contenteditable/directive'))
};