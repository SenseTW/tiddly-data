import * as mocha from 'mocha';
import * as chai from 'chai';
import { Wiki, TMap } from './tiddly-data';

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