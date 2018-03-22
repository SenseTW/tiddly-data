import * as P from 'parsimmon';
import { reduceRight, reduce, mergeDeepRight, is } from 'ramda';

const TrelloCard = P.createLanguage({
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

export namespace Title {
  export const fromString = (s: string): { name: string, preview: string, tags: string[] } =>
    TrelloCard.Title.tryParse(s);
}