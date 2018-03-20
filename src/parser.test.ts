import * as mocha from 'mocha';
import { expect } from 'chai';
import * as P from './parser';

export const sampleWiki = `
  created: 20180314035638346
  modified: 20180315043436460
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

export const sampleDefaultMap = `
  created: 20180314040533925
  modified: 20180314040533925
  title: $:/plugins/felixhayashi/tiddlymap/graph/views/Default/map
  type: text/vnd.tiddlywiki

  {
    "53ea5b24-9c03-4da9-8f06-4bcfcbd7765b": {
      "x": -54,
      "y": -266
    },
    "33c0840e-ebcf-4144-8cbb-9c71c919dfdc": {
      "x": -271,
      "y": -163
    },
    "e09841b7-6274-449c-b2a4-08ad4880a115": {
      "x": -61,
      "y": -157
    },
    "b46ca099-428d-4830-97d4-d6d6d8fdf5c2": {
      "x": 162,
      "y": -159
    },
    "bdd1331f-d8be-4f51-a0b3-47bf66914265": {
      "x": -363,
      "y": -23
    },
    "962181c0-0d14-4351-a93c-d467898fa69b": {
      "x": -201,
      "y": -22
    },
    "3c24bf0c-6ca8-40a6-94a4-f546d567d19f": {
      "x": -17,
      "y": -23
    },
    "b3f24f83-ff56-4cb8-90b0-8c7fb5178823": {
      "x": 112,
      "y": -19
    },
    "1562f995-b242-42b5-9b40-f468825918fd": {
      "x": 284,
      "y": -18
    },
    "05d2ffc5-577d-420e-8f36-28fad4a54ffd": {
      "x": -201,
      "y": 107
    },
    "f7dbadec-eab1-4559-8ae7-c94d8ecc6479": {
      "x": -69,
      "y": 104
    },
    "519b496c-33e6-45a2-b118-594646174705": {
      "x": 27,
      "y": 102
    }
  }
`

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