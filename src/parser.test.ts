import * as mocha from 'mocha';
import { expect } from 'chai';
import * as P from './parser';

export const sampleWiki = `created: 20180314035638346
modified: 20180315043436460
tags: 
title: 缺乏基礎研發人材
tmap.edges: {"10061a94-1831-4e19-87b1-9e33dc55eb86":{"to":"33c0840e-ebcf-4144-8cbb-9c71c919dfdc","type":"problem-solution:subproblem"}}
tmap.id: bdd1331f-d8be-4f51-a0b3-47bf66914265
type: text/vnd.tiddlywiki

! Key Questions

{{台灣人工智慧社團 - Kurt Bowyer 2018-01-22||opinion-quote}}

{{風傳媒 - 〈160億計畫50億花在硬體，科技部AI計畫被批錢未花刀口〉||opinion-quote}}

! Policy & Reference

{{公告科技部「AI 創新研究中心專案計畫」研究中心計畫申請案通過名單及媒合會議說明||document-quote}}

{{科技部啟動半導體射月計畫　促成人工智慧終端(AI Edge)產業鏈技術躍升||document-quote}}
`

export const sampleDefaultMap = `created: 20180314040533925
modified: 20180314040533925
title: $:/plugins/felixhayashi/tiddlymap/graph/views/Default/map
type: text/vnd.tiddlywiki

{
  "bdd1331f-d8be-4f51-a0b3-47bf66914265": {
    "x": 1,
    "y": 1
  }
}`

describe('Parser', () => {
  it('should parse a Wikitext file', () => {
    const w = P.TiddlyFile.File.tryParse(sampleWiki);

    // all values are strings
    expect(w.created).to.be.equal('20180314035638346');
    expect(w.modified).to.be.equal('20180315043436460');
    expect(w.title).to.be.equal('缺乏基礎研發人材');
    expect(w.tmap.edges).to.be.equal('{"10061a94-1831-4e19-87b1-9e33dc55eb86":{"to":"33c0840e-ebcf-4144-8cbb-9c71c919dfdc","type":"problem-solution:subproblem"}}');
    expect(w.tmap.id).to.be.equal('bdd1331f-d8be-4f51-a0b3-47bf66914265');
    expect(w.type).to.be.equal('text/vnd.tiddlywiki');
    expect(w.text).to.be.string;
  });
});

describe('Helpers', () => {
  describe('flattenObject', () => {
    it('should flatten a nested object', () => {
      const o = { foo: 'bar', foobar: { baz: 'foo' } };
      const p = P.flattenObject(o);

      expect(p.foo).to.be.equal('bar');
      expect(p['foobar.baz']).to.be.equal('foo');
    })
  });
});