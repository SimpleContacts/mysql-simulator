/* eslint-disable no-use-before-define */

const read = require('fs').readFileSync;

const isArray = s => s && s.constructor === Array;

// read pegjs file.
const load = name => {
  const nameWithExt = name.indexOf('.') === -1 ? `${name}.pegjs` : name;
  return read(`${__dirname}/${nameWithExt}`);
};

const processList = (def, name, expressionList = [], definitions, listName) => {
  const typesToIgnore = ['list', 'or'];

  def
    .filter(subDef => !typesToIgnore.includes(subDef.type))
    .forEach((subdef, index) => {
      expressionList.push(
        toPegHelper(
          subdef,
          `${name}_${index}`,
          expressionList,
          definitions,
          listName,
        ),
      );
    });

  const rule = def
    .filter(subDef => !typesToIgnore.includes(subDef.type))
    .map((subDef, index) => {
      const optional = subDef.type === 'optional';
      const parens = subDef.type === 'parens';
      return `w* ${parens ? '"(" w* ' : ''}st${index}:${name}_${index}${
        optional ? '?' : ''
      } ${parens ? ' w* ")"' : ''}`;
    })
    .join(' ');

  const isList = def.find(d => d.type === 'list');
  const isOr = def.find(d => d.type === 'or');
  const result = def
    .filter(subDef => !typesToIgnore.includes(subDef.type))
    .map((subDef, index) => `...st${index}`)
    .join(',');

  if (isOr) {
    const optionsSplit = def.reduce(
      (options, d) => {
        if (d.type === 'or') {
          return [...options, []];
        }

        const newOptions = options.slice(0);
        newOptions[newOptions.length - 1].push(d);
        return newOptions;
      },
      [[]],
    );

    return `
${name} = ${optionsSplit.map((d, i) => `${name}_o${i}`).join(' / ')}
${optionsSplit
      .map(
        (d, i) =>
          `${processList(
            d,
            `${name}_o${i}`,
            expressionList,
            definitions,
            listName,
          )}`,
      )
      .join('\n')}
    `;
  } else if (isList) {
    const identifierInList = def.find(d => d.type === 'identifier');
    return `${name} = r:${name}_rule rest:${name}_rest+ { return { ${
      identifierInList ? identifierInList.name : listName
    }_list: [r].concat(rest) } }
${name}_rule = ${rule} { return { ${result} } }
${name}_rest = ${isList.comma ? '"," w*' : ''} r:${name}_rule { return r }
    `;
  }
  return `${name} = ${rule} { return { ${result} } }`;
};

// How does the parsed documentation translate into its own Peg grammer ?
const toPegHelper = (
  def,
  name,
  expressionList = [],
  definitions = [],
  listName,
) => {
  if (isArray(def)) {
    return processList(def, name, expressionList, definitions, listName);
  }

  switch (def.type) {
    case 'comment':
      return `/* ${def.raw} */`;
    case 'string':
      return `${name} = quotedString`;
    case 'stringLiteral': {
      const str = JSON.stringify(def.string);
      const key =
        def.name ||
        def.string
          .toLowerCase()
          .split(' ')
          .join('_');
      return `${name} = ${str}i { return { ${key}: true } }`;
    }
    case 'identifier': {
      if (definitions.indexOf(def.name) !== -1) {
        return `${name} = ${def.name}`;
      }
      return `${name} = d:docIdentifier { return { ${def.name}: d }; }`;
    }
    case 'parens':
    case 'block':
    case 'optional': {
      return processList(
        def.expression,
        name,
        expressionList,
        definitions,
        listName,
      );
    }
    default:
      throw new Error(`Unknown type ${def.type}, ${JSON.stringify(def)}`);
  }
};

const toPeg = body => {
  const expressionList = [];

  /**
   * TODO find list items, remove them and mark previous elements as a list.
   * in processList, add "+" character
   */

  /**
   * Take out any definitions so they are available
   */
  const definitions = [];
  body
    .filter(block => isArray(block) && block[0].type === 'definition')
    .forEach(def => {
      const expr = processList(
        def.slice(1),
        def[0].name,
        expressionList,
        definitions,
        def[0].name,
      );
      expressionList.push(expr);

      definitions.push(def[0].name);
    });

  const bodyWithoutDefinitions = body.filter(
    block => isArray(block) && block[0].type !== 'definition',
  );

  /**
   * Evaluate expression with definitions
   */
  const nameFromDef = def => {
    const sLiteral = def.find(d => d.type === 'stringLiteral');
    const identifier = def.find(d => d.type === 'identifier');
    if (!sLiteral && !identifier)
      throw new Error(
        `Must contain a string literal or identifier ${JSON.stringify(
          def,
          null,
          2,
        )}`,
      );
    return (sLiteral
      ? sLiteral.string
          .toLowerCase()
          .split(' ')
          .join('_')
      : identifier.name
    ).toLowerCase();
  };

  const expressions = bodyWithoutDefinitions.map(def => {
    return toPegHelper(
      def,
      nameFromDef(def),
      expressionList,
      definitions,
      nameFromDef(def),
    );
  });

  return `
start = a:anyExpr rest:startRest* ";"? w* { return rest.concat(a) }
startRest = ";" w* a:anyExpr { return a }
anyExpr = ${bodyWithoutDefinitions.map(def => nameFromDef(def)).join(' / ')}

/* expressions */
${expressions.join('\n')}

/* sub expressions */
${expressionList.join('\n')}

  `;
};

module.exports = body => {
  return `${toPeg(body)}
    ${load('misc')}`;
};
