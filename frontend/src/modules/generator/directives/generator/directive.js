import _ from 'lodash';

export default ['$compile', '$timeout', ($compile, $timeout) => {
  return {
    restrict: 'A',
    scope: {},
    link($scope, element, attributes) {
      const tag = element[0].tagName,
            {splitOn, source, destination} = attributes,
            attributeString = createAttributeString();

      $scope.$parent.$watch(source, spawnExisting);

      attachSplit($scope);

      function createAttributeString() {
        const {$attr} = attributes,
              inheritedAttributes = _.difference(_.values($attr), ['split-on', 'source', 'destination']);

        return _.map(
          inheritedAttributes,
          (value, name) =>
            ` ${value}${attributes[name] ? '=' + attributes[name] : ''}`).join('');
      }

      function spawnExisting(items = []) {

        console.log({$scope, source, attributes, items});
        items.map(item => {
          const scope = split();

          scope[destination] = item;
          console.log('Spawned', scope);
        });
      }

      function attachSplit(scope) {
        const off = scope.$on(splitOn, splitInFuture);
        scope.split = split;

        function splitInFuture() {
          off();
          return $timeout(split, 0);
        }
      }

      function split(scope = $scope.$new(true)) {
        attachSplit(scope);

        before(element, $compile(`<${tag}${attributeString}></${tag}>`)(scope));

        delete attributes['splitOn'];

        return scope;
      }
    }
  };
}];

function before(el, newEl) {
  el.parent().prepend(newEl);
}