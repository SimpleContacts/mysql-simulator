import invariant from 'invariant';

import { escape, quoteInExpressionContext, unquote } from './utils';
import type { MySQLVersion } from './utils';

export function serialize(node, target) {
  invariant(node, 'expected a node');
  invariant(target === '5.7' || target === '8.0', `Expected a valid MySQL version as the target, but got: ${target}`);

  if (Array.isArray(node)) {
    return node.map((v) => serialize(v, target)).join(', ');
  }

  const TRUE = target === '5.7' ? 'TRUE' : 'true';
  const FALSE = target === '5.7' ? 'FALSE' : 'false';

  switch (node.type) {
    case 'callExpression':
      return serializeCallExpression(node, target);

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
        if (target === '5.7') {
          // #lolmysql-5.7, go home
          return `isnull(${serialize(node.expr, target)})`;
        } else {
          return `(${serialize(node.expr, target)} is null)`;
        }
      } else if (node.op === 'is not null') {
        return `(${serialize(node.expr, target)} is not null)`;
      } else if (node.op === '!') {
        if (target === '5.7') {
          // #lolmysql, extra wrapping in parens
          return `(not(${serialize(node.expr, target)}))`;
        } else {
          return `(0 = ${serialize(node.expr, target)})`;
        }
      } else if (node.op === '+') {
        // #lolmysql, explicitly stripping the wrapping
        return serialize(node.expr, target);
      }

      // "Normal" cases
      return `${node.op}(${serialize(node.expr, target)})`;

    case 'binary': {
      let op = node.op;

      // #lolmysql, for some reason it only lowercases these op names, but not
      // others...
      if (['AND', 'OR', 'XOR', 'LIKE', 'REGEXP'].includes(op)) {
        op = op.toLowerCase();
      }

      if (target === '5.7') {
        return `(${serialize(node.expr1, target)} ${op} ${serialize(node.expr2, target)})`;
      } else {
        return `((0 <> ${serialize(node.expr1, target)}) ${op} (0 <> ${serialize(node.expr2, target)}))`;
      }
    }

    case 'identifier':
      return escape(node.name);

    case 'builtinFunction':
      return node.name.toLowerCase();

    default:
      throw new Error(`Don't know how to serialize ${node.type} nodes yet.  Please tell me.`);
  }
}

function serializeCallExpression(node, target) {
  invariant(node.type === 'callExpression', `not a call expression node: ${node}`);
  let f = serialize(node.name, target);
  if (node.args !== undefined) {
    f += `(${node.args.map((v) => serialize(v, target)).join(',')})`;
  }
  return f;
}
