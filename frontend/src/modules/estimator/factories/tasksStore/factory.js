import _ from 'lodash';
import lzs from 'lz-string';

module.exports = ['localStorage', localStorage => {
  console.log({localStorage});
  const tasks = loadTasks() || {};
  console.log({tasks});

  function get(key) {
    const packed = localStorage.getItem(key),
          text = packed ? lzs.decompressFromUTF16(packed) : undefined;
console.log('Read', key, 'got', text);
    return text;
  }

  function set(key, value) {
console.log('Setting', key, 'to', value);
    if (value === undefined) localStorage.removeItem(key); // do we want this?
    else localStorage.setItem(key, lzs.compressToUTF16(text));
  }

  function getJSON(key) {
    const text = get(key);
    return text ? JSON.parse(text) : undefined;
  }

  function setJSON(key, value) {
    set(key, JSON.stringify(value));
  }

  function loadTasks() {
    const taskIds = getJSON('taskIds') || [];

    return taskIds.map(id => getJSON(`task-${id}`));
  }

  let _id = tasks.length;

  // ignore these comments

  // const transitions = {
  //   Tasks: {
  //     //$state: Tasks,
  //     add: ({Task}, text) => Task(text)
  //   },
  //   Task: {
  //     //$state: Task,
  //     update: ({update}, text) => update(text),
  //     start: ({start}) => start(),
  //     pause: ({pause}) => pause(),
  //     done: ({done}) => done()
  //   }
  // };

  // const context = {
  //   Tasks: {
  //     Task
  //   }
  // };

  // function Task(text) {

  // }

  // const resolve = ([part, ...rest], transitions = transitions, context = clone(context)) => mark(context, part) && rest ? resolve(rest, transitions[part], context) : (data => transitions[part](context, data));

  // function clone(context) {
  //   return {};
  // }

  // function mark(fakeContext, item) {
  //   fakeContext[item] = context[item];

  //   return fakeContext;
  // }

  // fold(eventSource, dispatch);

  // function dispatch([path, data]) {
  //   return resolve(path)(data);
  // }

  return {
    addTask,
    updateTask,
    getTasks,
    startTask,
    pauseTask,
    endTask,
    tasks
  };

  function addTask(config = {}) {
    const id = nextId(),
          created = new Date(),
          record = createRecord(),
          {text, estimate, tags, parent} = config;

    let task =
        tasks[id] = {
          id,
          parent,
          text,
          estimate,
          tags,
          created,
          record,
          isDone: false
        };

    storeTaskIds(tasks);
    storeTask(task);

    console.log('Adding task', task);

    return task;

    function createRecord() {
      return {
        summary: {total: 0, start: false, end: false, inProgress: false, componentCount: 0, done: false, longestComponent: 0},
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
    console.log('startTask', {task});
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
    summary.inProgress = true;
    summary.done = false;

    if (!summary.start) {
      summary.start = start;
    }

    storeTask(task);

    function nextComponentId(task) {
      return summary.componentCount;
    }
  }

  function pauseTask(task) {
    const {record} = task,
          {components, currentComponent, summary} = record,
          {start} = currentComponent,
          now = new Date().getTime(),
          total = now - start;

    currentComponent.end = now;
    currentComponent.total = total;

    summary.end = now;
    summary.inProgress = false;

    summary.total = _.reduce(components, (sum, {end, start}) => sum + (end - start), 0);

    if (total > summary.longestComponent || 0) summary.longestComponent = total;

    delete record.currentComponent;

    storeTask(task);
  }

  function endTask(task) {
    const {record} = task,
          {currentComponent, summary} = record;

    if (currentComponent) pauseTask(task);

    task.end = new Date().getTime();

    summary.done = true;

    storeTask(task);
  }

  function nextId() { // consider uuid
    return _id++;
  }

  function storeTaskIds(tasks) {
    localStorage.setItem(`taskIds`, lzs.compressToUTF16(JSON.stringify(tasks.map(({id}) => (id)))));
  }

  function storeTask(task) {
    const {id} = task;
    localStorage.setItem(`task-${id}`, lzs.compressToUTF16(JSON.stringify(task)));
  }
}];

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
    history.push(bundle(event));
  }

  function listen(callback) {
    lock();
    lock = stream.on(event => {
      const e = bundle(event);
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

  function bundle(event) { return {event, at: new Date(), version: version++}; }
}

function register(obj) {
  const schemas = {};

  _.each(obj, (schema, name) => {
    schemas[name] = schema;
  });

  return name => {
    const obj = {},
          data = {},
          eventStream = stream(),
          schema = schemas[name];

    if (!schema) throw Error(`No schema with name: ${name}!`);

    _.each(schema, addProperty);

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

    function addProperty(type, propertyName) {
      const {name: typeName, initializer, setter} = type;

      initializer(data, propertyName);
      defineAccessors(obj, propertyName, setter);

      function defineAccessors(obj, propertyName, setter) {
        Object.defineProperty(obj, propertyName, {
          get: () => data[propertyName],
          set: value => eventStream.emit(setter(data, propertyName, value))
        });
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