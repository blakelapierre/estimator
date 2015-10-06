import _ from 'lodash';

module.exports = () => {
  return {
    restrict: 'E',
    template: require('./template.html'),
    scope: {
      'task': '='
    },
    controller: ['$scope', 'tasksStore', ($scope, tasksStore) => {
      console.log('task, task', $scope.task);
      const states = (() => {
        const transitions = {
          cancel:  {text: 'Cancel',  state: 'done'},
          domore:  {text: 'Do More', state: 'domore'},
          done:    {text: 'Done',    state: 'done',   action: 'done'},
          pause:   {text: 'Pause',   state: 'paused', action: 'pause'},
          resume:  {text: 'Resume',  state: 'doing',  action: 'start'},
          start:   {text: 'Start',   state: 'doing',  action: 'start'}
        };

        const {cancel, done, domore, pause, resume, start} = transitions;

        return {
          doing:   [done, pause],
          domore:  [resume, cancel],
          done:    [domore],
          newTask: [start],
          paused:  [done, resume]
        };
      })();

      const prompts = {
        doing: 'Task Active',
        domore: 'Are You Sure?',
        done: 'Task Complete',
        newTask: 'Press Here To Begin ->',
        paused: 'Task Paused'
      };

      const map = (({endTask, pauseTask, startTask}) => ({
        'done': endTask,
        'pause': pauseTask,
        'start': startTask
      }))(tasksStore);

      $scope.commands = states.newTask;
      $scope.commandPrompt = prompts.newTask;

      $scope.activate = command => {
        const {action, state} = command,
              fn = map[action],
              {task} = $scope;

        if (fn) fn(task);

        $scope.commands = states[state];
        $scope.commandPrompt = prompts[state];
        $scope.currentState = state;
      };

      $scope.timeSpent = () => {
        const {task: {record: {summary, components, currentComponent}}} = $scope,
              { total} = summary;

        return timeToString(total + (currentComponent ?  (new Date().getTime() - currentComponent.start): 0));
      };

      // let isEditing = false;
      let isEditing = true;

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
        console.log('text changed', newValue);
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
          $scope.text = newValue;
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
  return text.match(/#([\w\d\s]+(  )?)/g);
  // return text.match(/#([\w\d]+)/g);
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

function timeToString(time) {
  let secondsTotal = time / 1000,
      milliseconds = time % 1000,
      [minutesTotal, seconds] = [secondsTotal / 60,           Math.floor(secondsTotal % 60)],
        [hoursTotal, minutes] = [minutesTotal / 60,           Math.floor(minutesTotal % 60)],
         [daysTotal,   hours] = [hoursTotal / 24,             Math.floor(hoursTotal % 24)],
             [years,    days] = [Math.floor(daysTotal / 365), Math.floor(daysTotal % 365)]; // won't handle leap years

  return _.compact(
          [
              years > 1 ? `${years} years` :               years        > 0 ? `${years} year` : undefined,
               days > 1 ? `${days} days`   :               days         > 0 ? `${days} day` : undefined,
              hours > 1 ? `${hours} hours` :               hours        > 0 ? `${hours} hour` : undefined,
            minutes > 1 ? `${minutes} minutes` :           minutes      > 0 ? `${minutes} minute` : undefined,
            seconds > 1 ? `${seconds} seconds` :           seconds      > 0 ? `${seconds} second` : undefined,
       milliseconds > 1 ? `${milliseconds} milliseconds` : milliseconds > 0 ? `${milliseconds} millisecond` : undefined
          ]
         ).join(' ');
}