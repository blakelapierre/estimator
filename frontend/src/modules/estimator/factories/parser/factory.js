import _ from 'lodash';

const grammar = (() => {
//   const s = {},
//         t = {
//     [s['@']]: {
//       [s['@']]: text,
//       [other]: date,

//       date
//     },
//     [s['#']]: {
//       [s['#']]: text,
//       [s[' ']]: end,
//       [s['\t']]: end,
//       [other]: tag,

//       tag,
//       end
//     },
//     [s['']]: text,

//     text
//   };

// (() => {

// })()


  return {
    '@': {
      '@': text,
      '': date
    },
    '#': {
      // '#': {
      //   // javascript,
      //   // r,
      //   // python,

      //   // 'javascript': javascript, // how to parameterize this?
      //   // // 'r': r,
      //   // // 'python': python,
      //   // // etc
      //   ' ': escapedHash
      // },
      '#': text,
      ' ': end,
      '\t': end,
      '': tag

      // function tag() {}

      // function end() {}
    },
    '': text
  };

  function text(stack, symbol, character) {
    const [frame] = stack,
          {symbol: dataSymbol} = frame;

    const data = frame[dataSymbol || symbol] = frame[dataSymbol || symbol] || {text: ''};

    data.text += character;

    console.log('text', {symbol, stack, data});

    return "text";
  }

  function date(stack, symbol, character) {
    const [frame] = stack;

    console.log('date', {symbol, stack});

    return "date";
  }

  function tag(stack, symbol, character) {
    const [frame] = stack,
          {symbol: dataSymbol} = frame;

    const data = frame[dataSymbol] = frame[dataSymbol] || {tag: ''};

    data.tag += character;
    console.log('tag', {dataSymbol, stack});

    return "tag";
  }

  function end(stack, symbol, character, emit) {
    const [frame] = stack,
          {symbol: dataSymbol} = frame;

    const data = frame[dataSymbol] = frame[dataSymbol] || {tag: ''};

    stack.splice(0, 1);

    emit(data);

    return "end";
  }
})();

function pda(grammar) {
  const symbols = {};

  function translate(character) {
    return symbols[character] || symbols[''];
  }

  function createTransition(value, key) {
    // Add new keys to symbol table
    symbols[key] = symbols[key] || Symbol(key);

    if (typeof value === 'function') return value;

    const transitions = _.mapKeys(_.mapValues(value, createTransition), (value, key) => symbols[key]);
    return (stack, symbol, character) => {
      console.log('pushed', symbol);
      stack.unshift({symbol, character, translate, transitions});
      return symbol;
      // transitions[symbol](symbol, stack);
    };
  }

  const transitions = _.mapKeys(_.mapValues(grammar, createTransition), (value, key) => symbols[key]);

  return {parse};

  function parse(string) {
    console.log('parsing', {string});

    return string.length > 0 ? p(string) : [];

    function p(string) {
      const stack = [{translate, transitions, symbol: translate(string[0])}];

      const emissions = [];


      let last;

      _.each(string, c => (last = consume(c)));


      // return _.map(string, consume);
      // _.each(string, consume);
      // const final = _.reduce(string, (_, character) => consume(character));
      console.log({last, stack});
      emit(stack[stack.length - 1][last]);

      return emissions;

      function consume(character) {
        const [frame] = stack,
              {translate, transitions} = frame,
              symbol = translate(character);

        console.log('consuming', {character, stack, symbol, transitions});

        (transitions[symbol] || transitions[symbols['']])(stack, symbol, character, emit);

        return symbol;
        // return (transitions[symbol] || transitions[symbols['']])(stack, symbol, character, emit);
      }

      function emit(...args) {
        emissions.push([...args]);
        console.log('emit', ...args);
      }
    }
  }
}

const a = pda(grammar);
console.log({a});


// const rootHandlers = {
//   '@': date,
//   '#': tag,
//   '':  other
// };

// const symbols = _.mapValues(rootHandlers, (value, key) => Symbol(key)),
//       handlers =  _.mapKeys(rootHandlers, (value, key) => symbols[key]);


// console.log({symbols, handlers});

// const startFrame = {translate, transitions: handlers},
//       stack = [startFrame];

// function date() { return symbols['date']; }

// function tag(string) {
//   const symbol = symbols['tag'];

//   let t = '';

//   stack.push([symbol, consumeTag]);

//   stack.push({translate, handlers: {[symbol]: handlers[symbol]}});

//   return symbol;

//   function consumeTag(character) {
//     if (character.match(/[A-Za-z\s]/)) {
//       t += character;
//       return symbols['character'];
//     }
//     else if (t.length > 0) {
//       return {symbol: symbols['end-tag'], tag: t};
//     }
//     else {
//       return 'wut';
//     }
//   }
// }

// function other() { return symbols['']; }

// function consume(character) {
//   const [frame] = stack,
//         {translate, transitions} = frame,
//         symbol = translate(character);

//   return transitions[symbol](symbol);
// }

// function consume(character) {
//   console.log('consuming', {character});

//   const symbol = translate(character);
//   console.log('saw', symbol);
//   return handlers[symbol](symbol);
// }

// function translate(character) {
//   const symbol =  symbols[character];

//   return symbol ? symbol : symbols[''];
// }

// function invert(obj) {
//   // Note: this expects there to be NO values with multiple keys
//   return _.transform(obj, (result, value, key) => result[value] = key, {});
// }




module.exports = () => ({
  parse: a.parse
});

// function parse(string) {
//   console.log('parsing', {string});
//   return _.map(string, consume);
// }
