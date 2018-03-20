import * as D from './tiddly-data';

export class Solution extends D.Node {
  public to: string;

  constructor({ to = '', ...rest }) {
    super(rest);

    this.to = to;
  }
}

export class Subproblem extends D.Node {
  public to: string;
  public description: string;
  public style: string;

  constructor({ to = '', description = '', style = '', ...rest }) {
    super(rest);

    this.to = to;
    this.description = description;
    this.style = style;
  }
}
