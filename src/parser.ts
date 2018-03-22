import * as P from 'parsimmon';
import { reduceRight, reduce, mergeDeepRight, is } from 'ramda';

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

export const TrelloCard = P.createLanguage({
  OptWhitespace: () =>
    P.regexp(/[^\S\n]*/),
  Symbol: (r) =>
    P.regexp(/[^【】#\s]+/),
  Tag: (r) =>
    P.seqMap(
      P.string('#'), r.Symbol,
      (_, tag) => tag
    ),
  Name: (r) =>
    P.seqMap(
      P.string('【'), r.OptWhitespace, r.Symbol.trim(P.optWhitespace).many(), r.OptWhitespace, P.string('】'),
      (_, __, ns, ___, ____) => ns.join(' ')
    ),
  Title: (r) =>
    P.seqMap(
      r.Name.trim(r.OptWhitespace).many(),
      r.OptWhitespace,
      r.Symbol.trim(P.optWhitespace).many(),
      r.OptWhitespace,
      r.Tag.trim(r.OptWhitespace).many(),
      (ns, _, ps, __, tags) => {
        const preview = ps.join('');
        let name;

        if (ns.length === 0) {
          name = preview;
        } else {
          name = ns[0];
        }

        return { name, preview, tags }
      }
    )
});

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