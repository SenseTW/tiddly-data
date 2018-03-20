import * as mocha from 'mocha';
import { expect } from 'chai';
import { Wiki, TMap, WikitextParser } from './tiddly-data';

const sampleHeader = `
  created: 20180314035638346
  modified: 20180315043436460
  title: 缺乏基礎研發人材
  tmap.edges: {"10061a94-1831-4e19-87b1-9e33dc55eb86":{"to":"33c0840e-ebcf-4144-8cbb-9c71c919dfdc","type":"problem-solution:subproblem"}}
  tmap.id: bdd1331f-d8be-4f51-a0b3-47bf66914265
  type: text/vnd.tiddlywiki
`;

const sampleWiki = `
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

describe('TiddlyData', () => {
  it('should create a wiki', () => {
    const w = new Wiki('缺乏基礎研發人材', 20180314035638346, 20180315043436460);

    expect(w.type).to.be.equal('text/vnd.tiddlywiki');
    expect(w.title).to.be.equal('缺乏基礎研發人材');
    expect(w.created).to.be.equal(20180314035638346);
    expect(w.modified).to.be.equal(20180315043436460);
  });

  it('should created a tiddly map node', () => {
    const m = new TMap('bdd1331f-d8be-4f51-a0b3-47bf66914265', '缺乏基礎研發人材', 20180314035638346, 20180315043436460);

    expect(m.type).to.be.equal('text/vnd.tiddlywiki');
    expect(m.title).to.be.equal('缺乏基礎研發人材');
    expect(m.created).to.be.equal(20180314035638346);
    expect(m.modified).to.be.equal(20180315043436460);

    expect(m.id).to.be.equal('bdd1331f-d8be-4f51-a0b3-47bf66914265');
    expect(m.edges.length).to.be.equal(0);
  })

  it('should created a solution edge', () => {
    throw new Error('not implemented');
  })

  it('should created a subproblem edge', () => {
    throw new Error('not implemented');
  })
});

describe('WikitextParser', () => {
  it('should parse a wikitext header', () => {
    const w = WikitextParser.Header.tryParse(sampleHeader);

    // all values are strings
    expect(w.created).to.be.equal('20180314035638346');
    expect(w.modified).to.be.equal('20180315043436460');
    expect(w.title).to.be.equal('缺乏基礎研發人材');
    expect(w.tmap.edges).to.be.equal('{"10061a94-1831-4e19-87b1-9e33dc55eb86":{"to":"33c0840e-ebcf-4144-8cbb-9c71c919dfdc","type":"problem-solution:subproblem"}}');
    expect(w.tmap.id).to.be.equal('bdd1331f-d8be-4f51-a0b3-47bf66914265');
    expect(w.type).to.be.equal('text/vnd.tiddlywiki');
  })

  it('should parse a wikitext file', () => {
    const w = WikitextParser.File.tryParse(sampleWiki);

    expect(w.header).to.be.an.instanceof(Object);
    expect(w.content).to.be.string;
  })
})