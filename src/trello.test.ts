import * as mocha from 'mocha';
import { expect } from 'chai';
import * as T from './trello';

const trelloCardTitle = '【科技工具如何讓新聞擁有更多可能性？】他認為 #嘿 #嘿嘿嘿';
const cleanCardTitle = '【科技工具如何讓新聞擁有更多可能性？】他認為';
const missingCardTitle = '他認為 #嘿 #嘿嘿嘿';
const newlineCardTitle = '他\n認為 #嘿 #嘿嘿嘿';

describe('Trello tools', () => {
  it('should parse a card title', () => {
    const c = T.Title.fromString(trelloCardTitle);

    expect(c.name).to.equal('科技工具如何讓新聞擁有更多可能性？');
    expect(c.preview).to.equal('他認為');
    expect(c.tags).to.deep.equal(['嘿', '嘿嘿嘿']);
  });

  it('should parse a card title without tags', () => {
    const c = T.Title.fromString(cleanCardTitle);

    expect(c.name).to.equal('科技工具如何讓新聞擁有更多可能性？');
    expect(c.preview).to.equal('他認為');
    expect(c.tags).to.deep.equal([]);
  });

  it('should parse a card title without a name', () => {
    const c = T.Title.fromString(missingCardTitle);

    expect(c.name).to.equal('他認為');
    expect(c.preview).to.equal('他認為');
    expect(c.tags).to.deep.equal(['嘿', '嘿嘿嘿']);
  });

  it('should parse a card title with newline characters', () => {
    const c = T.Title.fromString(newlineCardTitle);

    expect(c.name).to.equal('他認為');
    expect(c.preview).to.equal('他認為');
    expect(c.tags).to.deep.equal(['嘿', '嘿嘿嘿']);
  });
});