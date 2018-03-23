import * as P from 'parsimmon';
import { reduceRight, reduce, mergeDeepRight, is } from 'ramda';
import * as uuidv5 from 'uuid/v5';

// the Wikitext parser
export const TiddlyFile = P.createLanguage({
  Colon: () =>
    P.string(':'),
  Dot: () =>
    P.string('.'),
  Symbol: () =>
    // XXX: should follow the JSON string definition
    P.regexp(/[a-z0-9_]+/)
      .map(r => [r]),
  Key: (r) =>
    P.alt(
      P.seqMap(
        r.Symbol, r.Dot, r.Key,
        (xs, _, ys) => xs.concat(ys)
      ),
      r.Symbol
    ),
  Value: () =>
    P.regexp(/[^\n]*/),
  OptWhitespace: () =>
    P.regexp(/[^\S\n]*/),
  Pair: (r) =>
    P.seqMap(
      r.Key, r.OptWhitespace, r.Colon, r.OptWhitespace, r.Value,
      (ks: string[], _, __, ___, value) => reduceRight((k, acc) => ({ [k]: acc }), value, ks)
    ),
  Header: (r) =>
    r.Pair.trim(P.optWhitespace).many()
      .map(reduce(mergeDeepRight, {})),
  File: (r) =>
    P.seqMap(
      r.Header, P.all,
      (headers, text) => ({ ...headers, text })
    )
});

// XXX: should move helpers elsewhere
export const flattenObject = (o: any): any => {
  let r = {};

  for (const k in o) {
    if (is(Object, o[k])) {
      const flatted = flattenObject(o[k]);
      for (const l in flatted) {
        r[`${k}.${l}`] = flatted[l]
      }
    } else {
      r[k] = o[k];
    }
  }

  return r;
};

const NAMESPACE = '2cb5cecd-1bab-4a9a-82f9-a1ece125cfc5';

export const idFrom = (s) => uuidv5(s, NAMESPACE);