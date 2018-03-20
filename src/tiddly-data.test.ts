import * as mocha from 'mocha';
import * as chai from 'chai';
import { Wiki, TMap, WikitextParser } from './tiddly-data';

const expect = chai.expect;

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
  it('should parse a wikitext file', () => {
    const text = `
      created: 20180314035638346
      modified: 20180315043436460
      title: 缺乏基礎研發人材
      tmap.edges: {"10061a94-1831-4e19-87b1-9e33dc55eb86":{"to":"33c0840e-ebcf-4144-8cbb-9c71c919dfdc","type":"problem-solution:subproblem"}}
      tmap.id: bdd1331f-d8be-4f51-a0b3-47bf66914265
      type: text/vnd.tiddlywiki
    `;

    const w = WikitextParser.File.tryParse(text);

    // all values are strings
    expect(w.created).to.be.equal('20180314035638346');
    expect(w.modified).to.be.equal('20180315043436460');
    expect(w.title).to.be.equal('缺乏基礎研發人材');
    expect(w.tmap.edges).to.be.equal('{"10061a94-1831-4e19-87b1-9e33dc55eb86":{"to":"33c0840e-ebcf-4144-8cbb-9c71c919dfdc","type":"problem-solution:subproblem"}}');
    expect(w.tmap.id).to.be.equal('bdd1331f-d8be-4f51-a0b3-47bf66914265');
    expect(w.type).to.be.equal('text/vnd.tiddlywiki');
  })
})