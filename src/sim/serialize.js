// @flow strict

import invariant from 'invariant';
import { quoteInExpressionContext, unquote } from './utils';

export function serialize(node) {
  if (Array.isArray(node)) {
    return node.map(serialize).join(', ');
  }

  switch (node.type) {
    case 'callExpression':
      return serializeCallExpression(node);

    case 'literal':
      return node.value === true
        ? 'TRUE'
        : node.value === false
        ? 'FALSE'
        : typeof node.value === 'string'
        ? quoteInExpressionContext(unquote(node.value))
        : node.value;

    case 'unary':
      if (node.op === '!') {
        // #lolmysql, extra wrapping in parens
        return `(not(${serialize(node.expr)}))`;
      } else if (node.op === '+') {
        // #lolmysql, explicitly stripping the wrapping
        return serialize(node.expr);
      }

      // "Normal" cases
      return `${node.op}(${serialize(node.expr)})`;

    case 'identifier':
      return node.name;

    case 'builtinFunction':
      return node.name;

    default:
      throw new Error(`Don't know how to serialize ${node.type} nodes yet.  Please tell me.`);
  }
}

function serializeCallExpression(node) {
  invariant(node.type === 'callExpression', `not a call expression node: ${node}`);
  let f = serialize(node.name);
  if (node.args !== undefined) {
    f += `(${node.args.map(serialize).join(', ')})`;
  }
  return f;
}
