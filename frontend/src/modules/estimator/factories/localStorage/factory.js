export default ['$window', '$rootScope', ({localStorage}, $rootScope) => {
  if (!localStorage) {
    $rootScope.broadcast('missing localStorage');
    alert('You will not be able to save your tasks!');

    // return a dummy that spawns alerts? :)
  }
  else return localStorage;
}];
