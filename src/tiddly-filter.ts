import * as P from 'parsimmon';

// spec: https://tiddlywiki.com/static/Filters.html
const TiddlyFilter = P.createLanguage({
  Parameter: (r) =>
    P.alt(
      P.seqMap(
        P.string('['), P.regexp(/[^\]]+/), P.string(']'),
        (_, value, __) => ({ type: 'hard', value } as Parameter)
      ),
      P.seqMap(
        P.string('{'), P.regexp(/[^}]+/), P.string('}'),
        (_, value, __) => ({ type: 'indirect', value } as Parameter)
      ),
      P.seqMap(
        P.string('<'), P.regexp(/[^>]+/), P.string('>'),
        (_, value, __) => ({ type: 'variable', value } as Parameter)
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
      (negate, [{ operator, suffix }], parameter) => ({ negate, operator, suffix, parameter } as Step)
    ),
  Run: (r) =>
    P.alt(
      P.seqMap(
        P.string('['), r.Step.atLeast(1), P.string(']'),
        (_, steps, __) => steps as Step[]
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
      (_, [prefix], run) => ({ prefix, run } as Expression)
    ).many()
});

export interface Parameter {
  type: 'hard' | 'indirect' | 'variable';
  value: string;
}

export type Operator = string;

export type Suffix = string;

export interface Step {
  negate: boolean;
  operator?: Operator;
  suffix?: Suffix;
  parameter: Parameter;
}

export type Run = (Step[] | string);

export interface Expression {
  prefix?: '+' | '-';
  run: Run;
}

export const fromString = (s: string): Expression[] =>
  TiddlyFilter.Expression.tryParse(s);

export const toString = (es: Expression[]): string => {
  let rs = [];
  let r = '';

  for (const e of es) {
    let r = '';

    if (e.prefix) r += e.prefix;
    if (typeof e.run === 'string') {
      if (!/\s/.test(e.run))
        r += e.run;
      else if (/"/.test(e.run))
        r += `'${e.run}'`;
      else
        r += `"${e.run}"`;
    } else {
      for (const step of e.run) {
        r += '[';
        if (step.negate) r += '!';
        if (step.operator) r += step.operator;
        if (step.suffix) r += `:${step.suffix}`;
        switch (step.parameter.type) {
          case 'hard':
            r += `[${step.parameter.value}]`;
            break;
          case 'indirect':
            r += `{${step.parameter.value}}`;
            break;
          case 'variable':
            r += `<${step.parameter.value}>`;
            break;
          default:
            throw new Error(`unknown parameter type: ${step.parameter.type}`);
        }
        r += ']';
      }
    }

    rs.push(r);
  }

  return rs.join(' ');
}