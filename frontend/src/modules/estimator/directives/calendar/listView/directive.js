module.exports = () => {
  return {
    restrict: 'E',
    template: require('./template.html'),
    controller: ['$scope', 'tasksStore', ($scope, tasksStore) => {
      $scope.tasks = tasksStore.getTasks();
    }]
  };
};