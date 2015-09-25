import _ from 'lodash';

export default ['$compile', '$timeout', ($compile, $timeout) => {
  return {
    restrict: 'A',

    link($scope, element, attributes) {
      const tag = element[0].tagName,
            splitOn = attributes['splitOn'],
            attributeString = _.map(attributes.$attr, (value, name) => ` ${name}="${attributes[name]}"`).join('');

      $scope.$on(splitOn, () => {
        console.log('is-editing');
        $timeout(split, 0);
      });

      $scope.split = split;

      function split() {
        const scope = $scope.$new(true);

        scope.$on(splitOn, split);
        scope.split = split;

        console.log('split', {$scope, element, attributes, attributeString});
        before(element, $compile(`<${tag}${attributeString}></${tag}>`)(scope));
      }
    }
  };
}];

function before(el, newEl) {
  el.parent().prepend(newEl);
}