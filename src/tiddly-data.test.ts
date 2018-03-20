import * as mocha from 'mocha';
import { expect } from 'chai';
import * as D from './tiddly-data';
import * as P from './parser';
import { sampleWiki, sampleDefaultMap } from './parser.test';

// XXX: TiddlyWiki dates are local dates: https://github.com/Jermolene/TiddlyWiki5/issues/280
const LOCAL_TIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSS'
const CONTENT_TYPE_TIDDLY_WIKI_5 = 'text/vnd.tiddlywiki'

const wiki = P.TiddlyFile.File.tryParse(sampleWiki);
const defaultMap = P.TiddlyFile.File.tryParse(sampleDefaultMap);

describe('TiddlyData', () => {
  it('should create a wiki', () => {
    const w = new D.Wiki(wiki);

    expect(w.type).to.be.equal(CONTENT_TYPE_TIDDLY_WIKI_5);
    expect(w.title).to.be.equal('缺乏基礎研發人材');
    expect(w.created.format(LOCAL_TIME_FORMAT)).to.be.equal('2018-03-14T03:56:38.346');
    expect(w.modified.format(LOCAL_TIME_FORMAT)).to.be.equal('2018-03-15T04:34:36.460');
  });

  it('should create a tiddly map node', () => {
    const w = new D.Node(wiki);

    expect(w.type).to.be.equal(CONTENT_TYPE_TIDDLY_WIKI_5);
    expect(w.title).to.be.equal('缺乏基礎研發人材');
    expect(w.created.format(LOCAL_TIME_FORMAT)).to.be.equal('2018-03-14T03:56:38.346');
    expect(w.modified.format(LOCAL_TIME_FORMAT)).to.be.equal('2018-03-15T04:34:36.460');

    expect(w.id).to.be.equal('bdd1331f-d8be-4f51-a0b3-47bf66914265');
    for (const k in w.edges) {
      const e = w.edges[k];

      expect(e.type).to.be.equal('problem-solution:subproblem');
      expect(e.to).to.be.string;
    }
  })

  it('should create a tiddly default map', () => {
    const w = new D.DefaultMap(defaultMap);

    expect(w.type).to.be.equal(CONTENT_TYPE_TIDDLY_WIKI_5);
    expect(w.title).to.be.equal('$:/plugins/felixhayashi/tiddlymap/graph/views/Default/map');
    expect(w.created.format(LOCAL_TIME_FORMAT)).to.be.equal('2018-03-14T04:05:33.925');
    expect(w.modified.format(LOCAL_TIME_FORMAT)).to.be.equal('2018-03-14T04:05:33.925');

    for (const k in w.nodeMap) {
      const v = w.nodeMap[k];

      expect(v).to.have.property('x');
      expect(v).to.have.property('y');
    }
  })
});