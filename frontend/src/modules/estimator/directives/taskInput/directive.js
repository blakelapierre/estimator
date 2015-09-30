import _ from 'lodash';

const commands = (() => {
  const {cancel, done, domore, pause, resume, start} =  {
    cancel:  {text: 'Cancel',  state: 'done'},
    domore:  {text: 'Do More', state: 'domore'},
    done:    {text: 'Done',    state: 'done'},
    pause:   {text: 'Pause',   state: 'paused'},
    resume:  {text: 'Resume',  state: 'doing'},
    start:   {text: 'Start',   state: 'doing'}
  };

  return {
    doing:   [pause, done],
    domore:  [resume, cancel],
    done:    [domore],
    newTask: [start],
    paused:  [resume, done]
  };
/*
{
  new {
    : start {
      "Start"
      -> doing
    }
  }

  doing {
    : pause {
      "Pause"
      -> paused
    }

    : done {
      "Done"
      -> done
    }
  }

  paused {
    : resume {
      "Resume"
      -> doing
    }

    : done {
      "Done"
      -> done
    }
  }

  done {
    : domore {
      "Do More"
      -> domore
    }
  }

  domore {
    : resume {
      "Resume"
      -> doing
    }

    : cancel {
      "Cancel"
      -> done
    }
  }
}
*/

  /*
// this should be equivalent in my grammar (haven't checked)
{
  new {
    : [start]
   -> doing
  }

  doing {
    : [pause, done]
   -> paused
   -> done
  }

  paused {
    : [resume, done]
   -> doing
   -> done
  }

  done {
    : [restart]
   -> restart
  }

  restart {
    : [resume, cancel]
   -> doing
   -> done
  }
}
  */
})();

module.exports = () => {
  return {
    restrict: 'E',
    template: require('./template.html'),
    controller: ['$scope', 'tasksStore', 'parser', ($scope, tasksStore, parser) => {
      $scope.commands = commands.newTask;

      $scope.transitionTo = state => {
        $scope.commands = commands[state];
      };

      let isEditing = false;

      $scope.$watch('task.text', textChanged);

      const extract = (() => {
        return _.throttle(() => _extract($scope.task.text), 0);

        function _extract(text) {
          const estimate = extractEstimate(text),
                tags = extractTags(text);

          if (estimate) {
            const {components} = estimate;

            $scope.estimate = _.map(components, ({magnitude, unit}) => `${magnitude} ${unitMap[unit]}`)
                                 .join(' ');
          }
          else $scope.estimate = '';

          $scope.tags = tags;
        }
      })();

      function textChanged(newValue, oldValue) {
        const haveValue = !!newValue;

        if (haveValue) {
          updateLocalState();
          extract();
        }
        else {
          $scope.isEditing = false;
          $scope.estimate = undefined;
          $scope.tags = undefined;
          $scope.task = undefined;
        }

        function updateLocalState() {
          if (!isEditing && !!newValue) {
            isEditing = true;
            $scope.task = addTask({text: newValue});
            $scope.$broadcast('is-editing');
          }

          $scope.isEditing = isEditing;
        }
      }

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
    const components = mapRegex(pattern.source, ([_, magnitude, unit]) => ({magnitude, unit}), matches),
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

// mapRegex(regex, ([p1, p2, p3]) => ({p1, p2, p3}));
// mapRegex(/(\d) (m)/, ([_, magnitude, unit]) => ({magnitude, unit}), ['5 m']);
// mapRegex(/(\\d+)\\s*(${units})[^a-zA-Z]?/g, ([_, magnitude, unit]) => ({magnitude, unit}), ['5 m']);

function mapRegex(regex, fn, list) {
  return list.map(item => fn(item.match(regex)));
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

function inMilliseconds({magnitude, unit}) {
  return toMilliseconds[unitMap[unit]](magnitude);
}