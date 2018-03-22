import * as mocha from 'mocha';
import { expect } from 'chai';
import * as F from './tiddly-filter';

const sample = '[!field:tmap.id[53ea5b24-9c03-4da9-8f06-4bcfcbd7765b]] -[field:tmap.id[33c0840e-ebcf-4144-8cbb-9c71c919dfdc]]';

describe('TiddlyWiki filter', () => {
  it('should create a filter from a string', () => {
    const fs = F.fromString(sample);

    expect(fs).to.be.an.instanceOf(Array);
    for (const f of fs) {
      expect(f.prefix).to.be.oneOf([undefined, '+', '-']);
      expect(f.run).to.be.an.instanceOf(Array);
      for (const step of f.run) {
        if (typeof step !== 'string') {
          expect(step.negate).to.be.oneOf([true, false]);
          expect(step.operator).to.be.string;
          expect(step.suffix).to.be.string;
          expect(step).to.have.property('parameter');
          expect(step.parameter.type).to.be.oneOf(['hard', 'indirect', 'variable']);
          expect(step.parameter.value).to.be.string;
        }
      }
    }
  });

  it('should reform a filter to a string', () => {
    const fs = F.fromString(sample);

    expect(F.toString(fs)).to.be.equal(sample);
  });
});