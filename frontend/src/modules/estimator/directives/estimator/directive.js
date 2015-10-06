module.exports = () => {
  return {
    restrict: 'E',
    template: require('./template.html'),
    controller: ['$scope', 'tasksStore', ($scope, tasksStore) => {
      $scope.fauxInputDown = $event => {
        const {keyCode} = $event;

        tasksStore.addTask({text: String.fromCharCode(keyCode)});

        $event.preventDefault();
      };

      $scope.tasks = tasksStore.tasks;

      $scope.$watch('tasks', tasks => console.log('tasks!', $scope.tasks));
    }]
  };
};