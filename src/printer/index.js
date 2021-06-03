// @flow strict

import invariant from 'invariant';

import type { Expression } from '../ast';
import { escape, insert, quote, quoteInExpressionContext, unquote } from './utils';

export { escape, insert, quote };

// TODO: Type this file, and declare Node as a proper AST node here
export function serializeExpression(node: Expression): string {
  invariant(node, 'expected a node');

  if (Array.isArray(node)) {
    return node.map(serializeExpression).join(', ');
  }

  switch (node.type) {
    case 'callExpression': {
      let f = node.name.name.name.toLowerCase();
      if (node.args !== null) {
        f += `(${node.args.map(serializeExpression).join(',')})`;
      }
      return f;
    }

    case 'literal':
      return node.value === true
        ? 'TRUE'
        : node.value === false
        ? 'FALSE'
        : node.value === null
        ? 'NULL'
        : typeof node.value === 'string'
        ? quoteInExpressionContext(unquote(node.value))
        : typeof node.value === 'number'
        ? String(node.value)
        : String(node.value);

    case 'unary':
      if (node.op === 'is null') {
        // #lolmysql, go home
        return `isnull(${serializeExpression(node.expr)})`;
      } else if (node.op === 'is not null') {
        return `(${serializeExpression(node.expr)} is not null)`;
      } else if (node.op === '!') {
        // #lolmysql, extra wrapping in parens
        return `(not(${serializeExpression(node.expr)}))`;
      } else if (node.op === '+') {
        // #lolmysql, explicitly stripping the wrapping
        return serializeExpression(node.expr);
      }

      // "Normal" cases
      return `${node.op}(${serializeExpression(node.expr)})`;

    case 'binary': {
      let op = node.op;

      // #lolmysql, for some reason it only lowercases these op names, but not
      // others...
      if (['AND', 'OR', 'XOR', 'LIKE', 'REGEXP'].includes(op)) {
        op = op.toLowerCase();
      }

      return `(${serializeExpression(node.expr1)} ${op} ${serializeExpression(node.expr2)})`;
    }

    case 'identifier':
      return escape(node.name);

    default:
      throw new Error(
        `Don't know how to serialize ${node.type} expressions yet. Please tell me. ${JSON.stringify(
          { node },
          null,
          2,
        )}`,
      );
  }
}
