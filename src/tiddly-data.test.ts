import * as mocha from 'mocha';
import * as chai from 'chai';
import { Wiki } from './tiddly-data';

const expect = chai.expect;

describe('TiddlyData', () => {
  it('should create a wiki', () => {
    const w = new Wiki('缺乏基礎研發人材', 20180314035638346, 20180315043436460);

    expect(w.type).to.be.equal('text/vnd.tiddlywiki');
    expect(w.title).to.be.equal('缺乏基礎研發人材');
    expect(w.created).to.be.equal(20180314035638346);
    expect(w.modified).to.be.equal(20180315043436460);
  });
});