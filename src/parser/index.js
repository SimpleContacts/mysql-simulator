/* eslint-disable import/no-extraneous-dependencies, global-require, no-empty */
const peg = require('pegjs');
const read = require('fs').readFileSync;
const createGrammerFromDoc = require('./createGrammerFromDoc');
const resolve = require('path').resolve;

const load = name => {
  const nameWithExt = name.indexOf('.') === -1 ? `${name}.pegjs` : name;
  return read(`${__dirname}/${nameWithExt}`);
};

let docParser;
try {
  docParser = peg.generate(`
    // Connects everything together
    ${load('doc')}
    ${load('misc')}
  `);
} catch (e) {
  e.message = `Error generating doc parser: ${__dirname}/doc.pegjs\n\n${
    e.message
  }`;
  throw e;
}

const generateParser = () => {
  const docAsString = read(resolve(__dirname, '../mysql.doc')).toString();
  let docAST;
  let grammer;

  /**
   * Parse documentation, get some AST-like data structure
   */
  try {
    docAST = docParser.parse(docAsString);
  } catch (e) {
    e.message = `Error parsing documentation ${doc}\n\n${e.message}`;
    throw e;
  }

  /**
   * Create a SQL grammer from the documentation-like AST
   */
  try {
    grammer = createGrammerFromDoc(docAST);
  } catch (e) {
    const line = e.location
      ? `Line ${e.location.start.line}, Column ${e.location.start.column}`
      : '';
    // TODO show snippet thats broken.
    e.stack = `Error creating SQL Parser from mysql.doc ${line}\n\n${e.stack}`;
    throw e;
  }
  return grammer;
};

module.exports = {
  docParser,
  buildStandAloneParser: () => {
    return peg.generate(generateParser(), { output: 'source' });
  },
  parse: sql => {
    let sqlParser;
    let result;

    /**
     * Create a SQL grammer from the documentation-like AST
     */
    try {
      sqlParser = peg.generate(generateParser()).parse;
    } catch (e) {
      const line = e.location
        ? `Line ${e.location.start.line}, Column ${e.location.start.column}`
        : '';
      // TODO show snippet thats broken.
      e.stack = `Error creating SQL Parser from mysql.doc ${line}\n\n${
        e.stack
      }`;
      throw e;
    }

    /**
     * Parse SQL given our custom grammer
     */
    try {
      result = sqlParser(sql);
    } catch (e) {
      e.message = `Error executing SQL with parser - ${e.message}`;
      throw e;
    }

    return result;
  },
};
