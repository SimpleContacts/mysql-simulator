// @flow

import chalk from 'chalk';

import { parse as rawParseSql } from './mysql';

const indent = (text: string): string =>
  text
    .split('\n')
    .map(s => `    ${s}`)
    .join('\n');

const NUM_CONTEXT_LINES_BEFORE = 4;
const NUM_CONTEXT_LINES_AFTER = 3;

// eslint-disable-next-line no-console
const error = console.error;

/**
 * Prints parser errors nicely
 */
const printErr = (filename, input, e: Error) => {
  // $FlowFixMe
  const loc = e.location;
  if (!loc) {
    // Likely not a parser error
    error(chalk.red(e.toString()));
    return;
  }

  const lines = input.split('\n');
  const { start, end } = loc;
  const before = lines.slice(
    start.line - 1 - NUM_CONTEXT_LINES_BEFORE,
    start.line - 1,
  );
  const line = lines[start.line - 1];
  const after = lines.slice(start.line, start.line + NUM_CONTEXT_LINES_AFTER);
  const offset = start.column;
  error(
    chalk.red(
      `Parse error${filename ? ` in ${chalk.bold(filename)}` : ''}: ${
        e.message
      }`,
    ),
  );
  error('');
  error(indent(chalk.gray(before.join('\n'))));
  error(indent(chalk.white(line)));
  error(
    indent(
      ' '.repeat(offset - 1) +
        chalk.yellow(
          '^'.repeat(end.line !== start.line ? 1 : end.column - start.column),
        ),
    ),
  );
  error(indent(chalk.gray(after.join('\n'))));
  error('');
};

/**
 * Human-friendly version of the raw generated parser's parse() function, but
 * with much better error reporting, showing source line position where it
 * failed.
 */
export default function parse(
  inputSql: string,
  filename: string = '',
): Array<*> {
  try {
    return rawParseSql(inputSql);
  } catch (e) {
    printErr(filename, inputSql, e);
    throw e;
  }
}
