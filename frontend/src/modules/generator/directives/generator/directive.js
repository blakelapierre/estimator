import _ from 'lodash';

export default ['$compile', '$timeout', ($compile, $timeout) => {
  return {
    restrict: 'A',

    link($scope, element, attributes) {
      const tag = element[0].tagName,
            splitOn = attributes['splitOn'],
            attributeString = _.map(attributes.$attr, (value, name) => ` ${value}="${attributes[name]}"`).join('');

      attachSplit($scope);

      function attachSplit(scope) {
        scope.$on(splitOn, () => $timeout(split, 0));
        scope.split = split;
      }

      function split() {
        const scope = $scope.$new(true);

        attachSplit(scope);

        before(element, $compile(`<${tag}${attributeString}></${tag}>`)(scope));
      }
    }
  };
}];

function before(el, newEl) {
  el.parent().prepend(newEl);
}