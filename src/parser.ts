import * as P from 'parsimmon';
import { reduceRight, reduce, mergeDeepRight } from 'ramda';

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
  Pair: (r) =>
    P.seqMap(
      r.Key, P.optWhitespace, r.Colon, P.optWhitespace, r.Value,
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