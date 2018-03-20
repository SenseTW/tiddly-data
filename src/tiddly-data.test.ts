import * as mocha from 'mocha';
import { expect } from 'chai';
import * as D from './tiddly-data';
import * as P from './parser';
import { sampleWiki } from './parser.test';

// XXX: TiddlyWiki dates are local dates: https://github.com/Jermolene/TiddlyWiki5/issues/280
const LOCAL_TIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSS'

const parsed = P.TiddlyFile.File.tryParse(sampleWiki);

describe('TiddlyData', () => {
  it('should create a wiki', () => {
    const w = new D.Wiki(parsed.title, parsed.created, parsed.modified);

    expect(w.type).to.be.equal('text/vnd.tiddlywiki');
    expect(w.title).to.be.equal('缺乏基礎研發人材');
    expect(w.created.format(LOCAL_TIME_FORMAT)).to.be.equal('2018-03-14T03:56:38.346');
    expect(w.modified.format(LOCAL_TIME_FORMAT)).to.be.equal('2018-03-15T04:34:36.460');
  });

  it('should created a tiddly map node', () => {
    const m = new D.Node(parsed.tmap.id, parsed.title, parsed.created, parsed.modified);

    expect(m.type).to.be.equal('text/vnd.tiddlywiki');
    expect(m.title).to.be.equal('缺乏基礎研發人材');
    expect(m.created.format(LOCAL_TIME_FORMAT)).to.be.equal('2018-03-14T03:56:38.346');
    expect(m.modified.format(LOCAL_TIME_FORMAT)).to.be.equal('2018-03-15T04:34:36.460');

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