// @flow

import { readFileSync as read } from 'fs';

import peg from 'pegjs';

const grammer = read(`${__dirname}/grammer.pegjs`).toString();
const { parse } = peg.generate(grammer);

export default parse;
