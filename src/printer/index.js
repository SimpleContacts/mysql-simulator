// @flow strict

import invariant from 'invariant';

import type { CurrentTimestamp, Expression } from '../ast';
import { escape, insert, quote, quoteInExpressionContext } from './utils';

//
// NOTE:
// For some reason, serialization of MySQL nodes happens slightly differently
// in an "expression context" (like to serialize the contents of an expression
// in a GENERATED AS clause vs in a "normal SQL" value position, like a default
// value, or a comment.
//
// In an expression context, internal function names will get lowercased, and
// strings with with quote characters will get serialized differently (as 'I\'m
// a quote' vs 'I''m a quote').
//
// Absolutely no clue why.
//
type FormattingOptions = {|
  context: 'EXPRESSION' | 'DEFAULT',
|};

export { escape, insert, quote };

export function serializeCurrentTimestamp(node: CurrentTimestamp): string {
  if (node.precision === null) {
    return 'CURRENT_TIMESTAMP';
  } else {
    return `CURRENT_TIMESTAMP(${node.precision})`;
  }
}

export function serializeExpression(node: Expression, options?: FormattingOptions): string {
  invariant(node, 'expected a node');

  // Helper to make recursing with the same options context easier
  const recurse = (expr: Expression) => serializeExpression(expr, options);

  if (Array.isArray(node)) {
    return node.map(recurse).join(', ');
  }

  switch (node._kind) {
    case 'CallExpression': {
      let func = node.callee.name;
      if (options?.context === 'EXPRESSION') {
        func = func.toLowerCase();
      }

      if (node.args !== null) {
        func += `(${node.args.map(recurse).join(',')})`;
      }
      return func;
    }

    case 'Literal': {
      const serializeString = options?.context === 'EXPRESSION' ? quoteInExpressionContext : quote;
      return node.value === true
        ? 'TRUE'
        : node.value === false
        ? 'FALSE'
        : node.value === null
        ? 'NULL'
        : typeof node.value === 'string'
        ? serializeString(node.value)
        : typeof node.value === 'number'
        ? String(node.value)
        : String(node.value);
    }

    case 'UnaryExpression':
      if (node.op === 'is null') {
        // #lolmysql, go home
        return `isnull(${recurse(node.expr)})`;
      } else if (node.op === 'is not null') {
        return `(${recurse(node.expr)} is not null)`;
      } else if (node.op === '!') {
        // #lolmysql, extra wrapping in parens
        return `(not(${recurse(node.expr)}))`;
      } else if (node.op === '+') {
        // #lolmysql, explicitly stripping the wrapping
        return recurse(node.expr);
      }

      // "Normal" cases
      return `${node.op}(${recurse(node.expr)})`;

    case 'BinaryExpression': {
      let op = node.op;

      // #lolmysql, for some reason it only lowercases these op names, but not
      // others...
      if (['AND', 'OR', 'XOR', 'LIKE', 'REGEXP'].includes(op)) {
        op = op.toLowerCase();
      }

      return `(${recurse(node.expr1)} ${op} ${recurse(node.expr2)})`;
    }

    case 'Identifier':
      return escape(node.name);

    default:
      throw new Error(
        `Don't know how to serialize ${node._kind} nodes yet. Please tell me. ${JSON.stringify({ node }, null, 2)}`,
      );
  }
}
