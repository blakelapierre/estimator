import _ from 'lodash';

export default ['$compile', '$timeout', ($compile, $timeout) => {
  return {
    restrict: 'A',
    scope: {},
    link($scope, element, attributes) {
      const tag = element[0].tagName,
            splitOn = attributes['splitOn'],
            attributeString = _.map(_.filter(attributes.$attr, value => value !== 'split-on'), (value, name) => ` ${value}="${attributes[name]}"`).join('');

      attachSplit($scope);

      function attachSplit(scope) {
        const off = scope.$on(splitOn, splitInFuture);
        scope.split = split;

        function splitInFuture() {
          off();
          return $timeout(split, 0);
        }
      }

      function split() {
        const scope = $scope.$new(true);

        attachSplit(scope);

        before(element, $compile(`<${tag}${attributeString}></${tag}>`)(scope));

        delete attributes['splitOn'];
      }
    }
  };
}];

function before(el, newEl) {
  el.parent().prepend(newEl);
}