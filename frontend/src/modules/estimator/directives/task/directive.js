module.exports = () => {
  return {
    restrict: 'E',
    template: require('./template.html'),
    scope: {
      'task': '='
    },
    controller: ['$scope', 'tasksStore', ($scope, tasksStore) => {
      $scope.startTimer = () => {
        const {task} = $scope;

        console.log('t', {task});

        tasksStore.startTask(task);

        console.log({task});
      };

      $scope.pauseTimer = () => {
        const {task} = $scope;

        console.log('t', {task});

        tasksStore.pauseTask(task);

        console.log({task});
      };

      $scope.done = () => {

      };

      $scope.notDone = () => {

      };
    }]
  };
};