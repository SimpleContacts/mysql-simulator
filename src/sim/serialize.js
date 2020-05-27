import invariant from 'invariant';

import { escape, quoteInExpressionContext, unquote } from './utils';
import type { MySQLVersion } from './utils';

export function serialize(node, target: MySQLVersion) {
  invariant(node, 'expected a node');

  if (Array.isArray(node)) {
    return node.map(serialize).join(', ');
  }

  const TRUE = target === '5.7' ? 'TRUE' : 'true';
  const FALSE = target === '5.7' ? 'FALSE' : 'false';

  switch (node.type) {
    case 'callExpression':
      return serializeCallExpression(node);

    case 'literal':
      return node.value === true
        ? TRUE
        : node.value === false
        ? FALSE
        : node.value === null
        ? 'NULL'
        : typeof node.value === 'string'
        ? quoteInExpressionContext(unquote(node.value), target)
        : node.value;

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

    case 'builtinFunction':
      return node.name.toLowerCase();

    default:
      throw new Error(`Don't know how to serialize ${node.type} nodes yet.  Please tell me.`);
  }
}

function serializeCallExpression(node) {
  invariant(node.type === 'callExpression', `not a call expression node: ${node}`);
  let f = serialize(node.name);
  if (node.args !== undefined) {
    f += `(${node.args.map(serialize).join(',')})`;
  }
  return f;
}
