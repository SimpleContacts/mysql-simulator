/* eslint-disable import/no-extraneous-dependencies, global-require, no-empty */
const peg = require('pegjs');
const read = require('fs').readFileSync;
const createGrammerFromDoc = require('./createGrammerFromDoc');

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

module.exports = {
  docParser,
  sqlParser: (doc, sql) => {
    let docAST;
    let sqlParser;
    let result;

    const docAsString = read(doc).toString();

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
      const grammer = createGrammerFromDoc(docAST);
      sqlParser = peg.generate(grammer).parse;
    } catch (e) {
      const line = e.location
        ? `Line ${e.location.start.line}, Column ${e.location.start.column}`
        : '';
      // TODO show snippet thats broken.
      e.stack = `Error creating SQL Parser from ${doc} ${line}\n\n${e.stack}`;
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
