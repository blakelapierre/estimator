import _ from 'lodash';

module.exports = () => {
  return {
    restrict: 'E',
    template: require('./template.html'),
    controller: ['$scope', '$interval', ($scope, $interval) => {

      const secondsIn = {
        day: 24 * 60 * 60
      };

      setTime();
      $interval(setTime, 60 * 1000);

      function setTime() {
        const now = new Date();

        $scope.currentTime = ((((now.getHours() * 60) +
                             now.getMinutes()) * 60) +
                             now.getSeconds()) / secondsIn['day'] * 100 + '%';
      }

      $scope.kimAnnotations = _.map([
        {
          title: 'Prep',
          duration: 60 * 60 + 11 * 60,
          background: 'linear-gradient(to right, rgba(227,145,180,1) 0%, rgba(196,25,97,1) 50%, rgba(227,145,180,1) 100%)'
        },
        {
          title: 'E-mail',
          duration:  13 * 60,
          background: 'linear-gradient(to right, rgba(180,227,145,1) 0%, rgba(97,196,25,1) 50%, rgba(180,227,145,1) 100%)'
        },
        {
          title: 'Website',
          duration:  60 * 60 + 40 * 60,
          background: 'linear-gradient(to right, rgba(180,180,180,1) 0%, rgba(97,97,97,1) 50%, rgba(180,180,180,1) 100%)'
        },
        {
          title: 'Writing',
          duration:  4 * 60 * 60 + 14 * 60,
          background: 'linear-gradient(to right, rgba(180,145,227,1) 0%, rgba(97,25,196,1) 50%, rgba(180,145,227,1) 100%)'
        }
      ], annotation => {
        const {duration} = annotation;

        let width = 0;

        if (typeof duration === 'number') {
          width = (duration / secondsIn['day']) * 100 + '%';
        }
        else {
          const [min, max] = duration;

          width = (min + ((max - min) / 2)) / secondsIn['day'] * 100 + '%';
        }

        annotation.width = width;

        return annotation;
      });

      $scope.kimAnnotations2 = _.map([
        {
          title: 'Writing',
          duration: 15 * 60,
          background: 'linear-gradient(to right, rgba(227,145,180,1) 0%, rgba(196,25,97,1) 50%, rgba(227,145,180,1) 100%)'
        },
        {
          title: 'Data Analysis',
          duration: 3 * 60 * 60 + 24 * 60,
          background: 'linear-gradient(to right, rgba(180,227,145,1) 0%, rgba(97,196,25,1) 50%, rgba(180,227,145,1) 100%)'
        },
        {
          title: 'Data Analysis',
          duration: 45 * 60,
          background: 'linear-gradient(to right, rgba(180,180,180,1) 0%, rgba(97,97,97,1) 50%, rgba(180,180,180,1) 100%)'
        },
        {
          title: 'Data Analysis',
          duration: 2 * 60 * 60 + 43 * 60,
          background: 'linear-gradient(to right, rgba(180,145,227,1) 0%, rgba(97,25,196,1) 50%, rgba(180,145,227,1) 100%)'
        }
      ], annotation => {
        const {duration} = annotation;

        let width = 0;

        if (typeof duration === 'number') {
          width = (duration / secondsIn['day']) * 100 + '%';
        }
        else {
          const [min, max] = duration;

          width = (min + ((max - min) / 2)) / secondsIn['day'] * 100 + '%';
        }

        annotation.width = width;

        return annotation;
      });



      $scope.annotations = _.map([
        {
          title: 'Sleep',
          duration: 7 * 60 * 60,
          background: 'linear-gradient(to right, rgba(180,180,180,1) 0%, rgba(97,97,97,1) 50%, rgba(180,180,180,1) 100%)'
        },
        {
          title: 'Personal Time',
          duration: 2 * 60 * 60,
          subTasks: [
            {
              title: 'Meditation',
              duration: 30 * 60
            },
            {
              title: 'Exercise',
              duration: 30 * 60
            },
            {
              title: 'Grooming',
              duration: 30 * 60
            },
            {
              title: 'Breakfast',
              duration: 20 * 60
            }
          ]
        },
        {
          title: 'Research',
          duration: 3 * 60 * 60,
          background: 'linear-gradient(to right, rgba(227,145,180,1) 0%, rgba(196,25,97,1) 50%, rgba(227,145,180,1) 100%)'
          // background: '#f00'
        },
        {
          title: 'Lunch',
          duration: [30 * 60, 60 * 60], // min, max
          background: 'linear-gradient(to right, rgba(180,227,145,1) 0%, rgba(97,196,25,1) 50%, rgba(180,227,145,1) 100%)'
          // background: '#0f0'
        },
        {
          title: 'Coding',
          duration: 5 * 60 * 60,
          background: 'linear-gradient(to right, rgba(180,145,227,1) 0%, rgba(97,25,196,1) 50%, rgba(180,145,227,1) 100%)'
          // background: '#00f'
        },
        {
          title: 'Dinner',
          duration: [30 * 60, 1.5 * 60 * 60],
          background: 'linear-gradient(to right, rgba(227,145,180,1) 0%, rgba(196,25,97,1) 50%, rgba(227,145,180,1) 100%)'
        },
        {
          title: 'Personal Time',
          duration: 4 * 60 * 60
        },
        {
          title: 'Sleep',
          duration: 1.5 * 60 * 60,
          background: 'linear-gradient(to right, rgba(180,180,180,1) 0%, rgba(97,97,97,1) 50%, rgba(180,180,180,1) 100%)'
        }
      ], annotation => {
        const {duration} = annotation;

        let width = 0;

        if (typeof duration === 'number') {
          width = (duration / secondsIn['day']) * 100 + '%';
        }
        else {
          const [min, max] = duration;

          width = (min + ((max - min) / 2)) / secondsIn['day'] * 100 + '%';
        }

        annotation.width = width;

        return annotation;
      });
    }]
  };
};