// @flow strict

import invariant from 'invariant';
import type { Expression } from '../ast';
import { escape, quoteInExpressionContext, unquote } from './utils';

// TODO: Type this file, and declare Node as a proper AST node here
export function serialize(node: Expression): string {
  invariant(node, 'expected a node');

  if (Array.isArray(node)) {
    return node.map(serialize).join(', ');
  }

  switch (node.type) {
    case 'callExpression': {
      let f = node.name.name.name.toLowerCase();
      if (node.args !== null) {
        f += `(${node.args.map(serialize).join(',')})`;
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
        return `isnull(${serialize(node.expr)})`;
      } else if (node.op === 'is not null') {
        return `(${serialize(node.expr)} is not null)`;
      } else if (node.op === '!') {
        // #lolmysql, extra wrapping in parens
        return `(not(${serialize(node.expr)}))`;
      } else if (node.op === '+') {
        // #lolmysql, explicitly stripping the wrapping
        return serialize(node.expr);
      }

      // "Normal" cases
      return `${node.op}(${serialize(node.expr)})`;

    case 'binary': {
      let op = node.op;

      // #lolmysql, for some reason it only lowercases these op names, but not
      // others...
      if (['AND', 'OR', 'XOR', 'LIKE', 'REGEXP'].includes(op)) {
        op = op.toLowerCase();
      }

      return `(${serialize(node.expr1)} ${op} ${serialize(node.expr2)})`;
    }

    case 'identifier':
      return escape(node.name);

    default:
      throw new Error(
        `Don't know how to serialize ${node.type} nodes yet. Please tell me. ${JSON.stringify({ node }, null, 2)}`,
      );
  }
}
