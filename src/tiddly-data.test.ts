import * as mocha from 'mocha';
import { expect } from 'chai';
import * as D from './tiddly-data';
import * as P from './parser';
import { sampleWiki } from './parser.test';

const parsed = P.TiddlyFile.File.tryParse(sampleWiki);

describe('TiddlyData', () => {
  it('should create a wiki', () => {
    const { header } = parsed;
    const w = new D.Wiki(header.title, +header.created, +header.modified);

    expect(w.type).to.be.equal('text/vnd.tiddlywiki');
    expect(w.title).to.be.equal('缺乏基礎研發人材');
    expect(w.created).to.be.equal(20180314035638346);
    expect(w.modified).to.be.equal(20180315043436460);
  });

  it('should created a tiddly map node', () => {
    const { header } = parsed;
    const m = new D.Node(header.tmap.id, header.title, +header.created, +header.modified);

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