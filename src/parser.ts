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

// spec: https://tiddlywiki.com/static/Filters.html
export const TiddlyFilter = P.createLanguage({
  Parameter: (r) =>
    P.alt(
      P.seqMap(
        P.string('['), P.regexp(/[^\]]+/), P.string(']'),
        (_, p, __) => p
      ),
      P.seqMap(
        P.string('{'), P.regexp(/[^}]+/), P.string('}'),
        (_, p, __) => p
      ),
      P.seqMap(
        P.string('<'), P.regexp(/[^>]+/), P.string('>'),
        (_, p, __) => p
      ),
    ),
  Operator: (r) =>
    // https://tiddlywiki.com/static/Filter%2520Operators.html
    P.alt(
      P.string('all'),
      P.string('backlinks'),
      P.string('count'),
      P.string('days'),
      P.string('each'),
      P.string('eachday'),
      P.string('enlist'),
      P.string('field'),
      P.string('fields'),
      P.string('get'),
      P.string('getindex'),
      P.string('has'),
      P.string('haschanged'),
      P.string('indexes'),
      P.string('is'),
      P.string('links'),
      P.string('list'),
      P.string('listed'),
      P.string('lookup'),
      P.string('minlength'),
      P.string('regexp'),
      P.string('sameday'),
      P.string('search'),
      P.string('title'),
      // order operators
      P.string('after'),
      P.string('before'),
      P.string('bf'),
      P.string('butfirst'),
      P.string('butlast'),
      P.string('first'),
      P.string('last'),
      P.string('limit'),
      P.string('next'),
      P.string('nsort'),
      P.string('nsortcs'),
      P.string('nth'),
      P.string('order'),
      P.string('previous'),
      P.string('rest'),
      P.string('reverse'),
      P.string('sort'),
      P.string('sortcs'),
      // listops operators
      P.string('allafter'),
      P.string('allbefore'),
      P.string('append'),
      P.string('insertbefore'),
      P.string('move'),
      P.string('prepend'),
      P.string('putafter'),
      P.string('putbefore'),
      P.string('putfirst'),
      P.string('putlast'),
      P.string('remove'),
      P.string('replace'),
      P.string('sortby'),
      // string operators
      P.string('addprefix'),
      P.string('addsuffix'),
      P.string('decodehtml'),
      P.string('decodeuri'),
      P.string('decodeuricomponent'),
      P.string('encodehtml'),
      P.string('encodeuri'),
      P.string('encodeuircomponent'),
      P.string('jsonstringify'),
      P.string('prefix'),
      P.string('removeprefix'),
      P.string('removesuffix'),
      P.string('splitbefore'),
      P.string('stringify'),
      P.string('suffix'),
      // tag operators
      P.string('tag'),
      P.string('tagging'),
      P.string('tags'),
      P.string('untagged'),
      // special operators
      P.string('commands'),
      P.string('editiondescription'),
      P.string('editions'),
      P.string('modules'),
      P.string('moduletypes'),
      P.string('plugintiddlers'),
      P.string('shadowsource'),
      P.string('storyviews')
    ),
  Suffix: (r) =>
    P.regexp(/[^[]*/),
  Step: (r) =>
    P.seqMap(
      P.string('!').atMost(1).map(r => !!r.length),
      P.seqMap(
        r.Operator,
        P.seqMap(
          P.string(':'), r.Suffix,
          (_, s) => s
        ).atMost(1),
        (operator, [suffix]) => ({ operator, suffix })
      ).atMost(1).map(([x]) => [x || { operator: undefined, suffix: undefined }]),
      r.Parameter,
      (negate, [{ operator, suffix }], parameter) => ({ negate, operator, suffix, parameter })
    ),
  Run: (r) =>
    P.alt(
      P.seqMap(
        P.string('['), r.Step.atLeast(1), P.string(']'),
        (_, steps, __) => steps
      ),
      P.seqMap(
        P.string('"'), P.regexp(/[^"]*/), P.string('"'),
        (_, s, __) => s
      ),
      P.seqMap(
        P.string("'"), P.regexp(/[^']*/), P.string("'"),
        (_, s, __) => s
      ),
      P.regexp(/[^\][\s]+/)
    ),
  Expression: (r) =>
    P.seqMap(
      P.optWhitespace, P.oneOf('+-').atMost(1), r.Run,
      (_, [prefix], run) => ({ prefix, run })
    ).many()
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