import _ from 'lodash';

module.exports = () => {
  return {
    restrict: 'E',
    template: require('./template.html'),
    controller: ['$scope', 'tasksStore', ($scope, tasksStore) => {
      $scope.$watch('task.text', (newValue, oldValue) => {
        const isEditing = !!newValue,
              estimate = extractEstimate(newValue),
              tags = extractTags(newValue);

        console.log({newValue, oldValue, estimate, tags});

        if (estimate) {
          const {components} = estimate;

          $scope.estimate = _.map(components, component => `${component.magnitude} ${unitMap[component.unit]}`)
                             .join(' ');
        }
        else $scope.estimate = '';

        if (!$scope.task) {
          $scope.task = tasksStore.addTask();
        }

        $scope.tags = tags;
        $scope.isEditing = isEditing;
      });

      $scope.taskKeypress = $event => {
        const {keyCode} = $event;

        console.log({keyCode, task: $scope.task});

        if (keyCode === 13) {
          const {task: text, estimate, tags} = $scope;

          const task = addTask({text, estimate, tags});
        }
      };

      function addTask(task) {
        return tasksStore.addTask(task);
      }
    }]
  };
};

const unitPatterns = {
  'seconds': 'seconds|second|sec|s',
  'minutes': 'minutes|minute|mins|min|mn|m',
  'hours':   'hours|hour|hrs|hr|h',
  'days':    'days|day|d',
  'weeks':   'weeks|week|wks|wk|w',
  'months':  'months|month|mths|mth|mos|mo|M',
  'year':    'years|year|yr|y',
  'decade':  'decades|decade',
  'century': 'centuries|century',
  'eon':     'eons|eon'
};

const units = _.map(unitPatterns, (unitPattern, unit) => unitPattern + '').join('|');

const unitMap = _.reduce(unitPatterns, (map, unitPattern, unit) => {
  const parts = unitPattern.split('|');
  _.each(parts, part => map[part] = unit);
  return map;
}, {});

const pattern = new RegExp(`(\\d+)\\s*(${units})[^a-zA-Z]?`, 'g');


const tree = buildTree(unitPatterns);

console.log({tree});

function e(tree, text) {
  const {length} = text,
        stack = [tree];

  let [node] = stack;

  for (let i = 0; i < length; i++) {
    const character = text.charAt(i),
          candidate = node[character];

    if (candidate) {
      node = candidate;
      stack.push(node);
    }
    else {

    }
  }
}

function check(text, node, start, length) {
  const stack = [node];

  for (let i = start; i < length; i++) {
    const character = text.charAt(i),
          candidate = node[character];

    if (candidate) {
      return candidate;
    }
    else {

    }
  }
}

function buildTree(patterns) {
  const tree = {};
  _.each(patterns, (pattern, unit) => {
    _.each(pattern.split('|'), word => {
      insertKey(tree, word, unit);
    });
  });
  return tree;
}

function insertKey(tree, key, word) {
  const {length} = key;

  let node = tree;

  for (let i = 0; i < length; i++) {
    const character = key.charAt(i),
          matchingNode = node[character];

    if (matchingNode) {
      node = matchingNode;
    }
    else {
      //insert
      const newNode = {};
      node[character] = newNode;
      node = newNode;
    }
  }

  node.value = word;
}

function extractEstimate(text = '') {
  const matches = text.match(pattern);
  if (matches) {
    const components = matches.map(match => ((([_, magnitude, unit]) => ({magnitude, unit}))(match.match(pattern.source)))),
          total = _.sum(components, inMilliseconds);

    return {
      total,
      components
    };
  }
}

function extractTags(text = '') {
  return text.match(/#([\w\d]+)/g);
}

const toMilliseconds = {
  'seconds': s => s * 1000,
  'minutes': m => m * 1000 * 60,
  'hours':   h => h * 1000 * 60 * 60,
  'days':    d => d * 1000 * 60 * 60 * 24,
  'weeks':   w => w * 1000 * 60 * 60 * 24 * 7,
  'months':  m => m * 1000 * 60 * 60 * 24 * (365.25 / 12),
  'year':    y => y * 1000 * 60 * 60 * 24 * 365.25,
  'decade':  d => d * 1000 * 60 * 60 * 24 * 365.25 * 10
};

function inMilliseconds(component) {
  const {magnitude, unit} = component;

  return toMilliseconds[unitMap[unit]](magnitude);
}