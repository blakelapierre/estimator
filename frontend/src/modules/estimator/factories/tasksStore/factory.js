import _ from 'lodash';

module.exports = () => {
  const tasks = {};

  let _id = 0;

  return {
    addTask,
    updateTask,
    getTasks,
    startTask,
    pauseTask,
    endTask
  };

  function addTask(config = {}) {
    const {text, estimate, tags} = config,
          id = nextId(),
          created = new Date(),
          record = createRecord();

    let task = tasks[id] = {
      id,
      text,
      estimate,
      tags,
      created,
      record,
      isDone: false
    };

    return task;

    function createRecord() {
      return {
        summary: {total: 0, start: false, end: false, inProgress: false, componentCount: 0},
        components: {}
      };
    }
  }

  function updateTask() {
    console.log('updateTasks', arguments);
  }

  function getTasks() {
    return tasks; // Should return copy-on-write and/or immutable structure here!
  }

  function startTask(task) {
    const {record} = task,
          {summary} = record;

    const start = new Date().getTime(),
          id = nextComponentId(task);

    const component = {
      id,
      start
    };

    console.log({record});

    record.components[id] = component;
    record.currentComponent = component;

    summary.componentCount++;

    if (!summary.start) {
      summary.start = start;
    }

    function nextComponentId(task) {
      return task.summary.componentCount;
    }
  }

  function pauseTask(task) {
    const {record} = task,
          {components, currentComponent, summary} = record,
          {start} = currentComponent,
          now = new Date().getTime();

    currentComponent.end = now;

    currentComponent.total = now - start;

    summary.end = now;
    summary.inProgress = false;

    summary.total = _.reduce(components, (sum, component) => {
      const {end, start} = component;
      return end - start;
    }, 0);

    delete record.currentComponent;
  }

  function endTask(task) {
    const {record} = task,
          {currentComponent, summary} = record;

    if (currentComponent) {
      pauseTask(task);
    }

    task.end = new Date().getTime();
  }

  function nextId() {
    return _id++;
  }
};

const task = {
  get id() { return 1; },
  set id(value) { throw Error('Cannot change id!'); }
};

console.log('t', task.id);

const schema = {
  'task': ['estimate', 'tag', 'record', (estimate, tag, record) => {
    return {
      id: auto(),
      text: string(),
      estimate: {estimate},
      tags: [tag],
      record: {record}
    };
  }],
  'estimate': {
    text: string()
  },
  'tag': {
    text: string()
  },
  'record': ['summary', 'component', (summary, component) => {
    return {
      summary: {summary},
      // components: [component]
      components: {id: component}
    };
  }],
  'summary': {
    'start': datetime(),
    'end': datetime(),
    'total': int(),
    'inProgress': bool()
  },
  'component': {
    id: auto(),
    start: datetime(),
    end: datetime(),
    total: int()
  }
};

const constructor = register(schema);

const {obj, eventStream} = constructor('summary');

const l = watch(eventStream).listen(r => console.log('obj', r));

manage(l);

console.log({obj, l});

obj.start = new Date();
obj.start = new Date();
obj.start = new Date();
obj.start = new Date();

l.listen(r => console.log('obj2', r));

setTimeout(() => {
  obj.start = new Date();
  obj.start = new Date();
  obj.start = new Date();
  obj.start = new Date();
}, 1000);

obj.name = 'blake';
obj.name = 'blake ';
obj.name = 'blake l';
obj.name = 'blake la';

console.log(obj.name);

(({a, b}, {c}) => {
  a = 'd';
  console.log({a, b, c});
})({a:'a', b:'b'}, {c:'c'});

function manage(w) {
  const interval = setInterval(() => {
    const history = w.truncate();
    if (history.length > 0) console.log({history});
  }, 1000);

  return () => clearInterval(interval);
}

function watch(stream) {
  let history = [],
      version = 0;

  let lock = stream.on(defaultHandler);

  return {
    listen,
    truncate
  };

  function defaultHandler(event) {
    history.push({event, at: new Date()});
  }

  function listen(callback) {
    lock();
    lock = stream.on(event => {
      const e = {event, at: new Date(), version};
      version++;
      history.push(e);
      callback(e);
    });
    return this;
  }

  function truncate() {
    const oldHistory = history;
    history = [];
    return oldHistory;
  }
}

function register(obj) {
  const schemas = {};

  _.each(obj, (schema, name) => {
    schemas[name] = schema;
  });

  return name => {
    const obj = {},
          data = {},
          eventStream = stream();

    const schema = schemas[name];

    if (!schema) throw Error(`No schema with name: ${name}!`);

    _.each(schema, (type, propertyName) => {
      const {name: typeName, initializer, setter} = type;

      initializer(data, propertyName);

      Object.defineProperty(obj, propertyName, {
        get: () => data[propertyName],
        set: value => eventStream.emit(setter(data, propertyName, value))
      });
    });

    return {
      obj,
      eventStream
    };

    function stream() {
      let callback = defaultCallback;

      return {
        emit,
        on
      };

      function defaultCallback() {}

      function emit(event) {
        callback(event);
      }

      function on(c) {
        callback = c || defaultCallback;
        return unregister;
      }

      function unregister() {
        callback = defaultCallback;
      }
    }
  };
}

function auto() {
  let id = 0;

  return {
    name: 'auto',
    initializer: (data, propertyName) => {
      data[propertyName] = id++;
    },
    setter: (data, propertyName, value) => {
      throw Error(`Cannot set ${propertyName}`, {data, value});
    }
  };
}

function string() {
  return defineType('string', defaultSetter);
}

function int() {
  return defineType('int', defaultSetter);
}

function bool() {
  return defineType('bool', defaultSetter);
}

function datetime() {
  return defineType('datetime', defaultSetter);
}

function defineType(name, setter) {
  return {
    name,
    initializer: defaultInitializer,
    setter
  };
}

function defaultInitializer() { }

function defaultSetter(data, propertyName, value) {
  data[propertyName] = value;

  return {
    set: {
      [propertyName]: value
    }
  };
}