import * as P from 'parsimmon';
import { reduceRight, reduce, mergeDeepRight } from 'ramda';

export type Timestamp = number;

export class Wiki {
  public type: string = 'text/vnd.tiddlywiki';

  public created: Timestamp;

  public modified: Timestamp;

  public title: string;

  public description?: string;

  public style?: object;

  constructor(title: string, created: Timestamp, modified: Timestamp = created) {
    this.title = title;
    this.created = created;
    this.modified = modified;
  }
}

export class TEdge extends Wiki {
  public id: string;

  public type: string;

  public to: string;

  constructor(id: string, to: string, type: string, title: string, created: Timestamp, modified: Timestamp) {
    super(title, created, modified);

    this.id = id;
    this.to = to;
    this.type = type;
  }
}

export class TMap extends Wiki {
  public edges: any[] = [];

  public id: string;

  constructor(id: string, title: string, created: Timestamp, modified: Timestamp) {
    super(title, created, modified);

    this.id = id;
  }
}

// the Wikitext parser
export const WikitextParser = P.createLanguage({
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
  File: (r) =>
    r.Pair.trim(P.optWhitespace).many()
      .map(reduce(mergeDeepRight, {}))
});