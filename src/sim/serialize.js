import invariant from 'invariant';

import { escape, quoteInExpressionContext, unquote } from './utils';

function takesBooleanOperands(op: string): boolean {
  return ['and', 'or', 'xor'].includes(op.toLowerCase());
}

function isBooleanOp(op: string): boolean {
  return ['and', 'or', 'xor', '=', '<>', '<=', '>=', '<', '>', 'like', 'ilike', 'regexp'].includes(op.toLowerCase());
}

/**
 * Like serialize, this will output a SQL expression, but if the nodes that are
 * being serialized here are not "known boolean values", the entire resulting
 * expression will get wrapped in a comparison against zero, e.g. "0 <>
 * (expr)", which is MySQL's way of expressing a "truthy" value.
 */
export function serializeTruthExpr(node, target) {
  // First of all, this whole thing wasn't a thing in MySQL 5.7, so in that
  // case, let's just exit early
  if (target === '5.7') {
    return serialize(node, target);
  }

  if (
    (node.type === 'literal' && typeof node.value === 'boolean') ||
    node.type === 'unary' ||
    (node.type === 'binary' && isBooleanOp(node.op))
  ) {
    return serialize(node, target);
  }

  // For all other cases, wrap this in a "truthy" assessment expression
  return `(0 <> ${serialize(node, target)})`;
}

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

      // #lolmysql-8.0 - wtf? for boolean operators, the operands are "truth"ed by comparing them against 0?
      if (takesBooleanOperands(op)) {
        return `(${serializeTruthExpr(node.expr1, target)} ${op} ${serializeTruthExpr(node.expr2, target)})`;
      } else {
        return `(${serialize(node.expr1, target)} ${op} ${serialize(node.expr2, target)})`;
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
