import * as objectAssign from 'object-assign';
import * as moment from 'moment';

const TIME_FORMAT = 'YYYYMMDDHHmmssSSS';

export class Wiki {
  public type: string;
  public created: moment.Moment;
  public modified: moment.Moment;
  public title?: string;
  public text?: string;
  public description?: string;
  public style?: string;

  constructor({ created = '', modified = '', ...rest } = {}) {
    this.created = moment.utc(created, TIME_FORMAT);
    this.modified = moment.utc(modified, TIME_FORMAT);

    objectAssign(this, rest);
  }
}

export type Edge = {
  type: string;
  to: string;
};

export class Node extends Wiki {
  public id: string;
  public edges: { [key: string]: Edge };

  constructor({ tmap: { id = '', edges = '' } = {}, ...rest } = {}) {
    super(rest);

    this.id = id;
    this.edges = JSON.parse(edges);
  }
}

export type Point = {
  x: number,
  y: number
};

export class DefaultMap extends Wiki {
  public nodeMap: { [key: string]: Point };

  constructor({ text = '', ...rest } = {}) {
    super(rest);

    this.nodeMap = JSON.parse(text);
  }
}