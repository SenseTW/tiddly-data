import * as objectAssign from 'object-assign';
import * as moment from 'moment';
import { clone } from 'ramda';

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

  constructor({ tmap: { id = '', edges = '{}' } = {}, ...rest } = {}) {
    super(rest);

    this.id = id;
    try {
      this.edges = JSON.parse(edges);
    } catch (e) {
      console.warn(e);
      this.edges = {};
    }
  }
}

export type Point = {
  x: number,
  y: number
};

export const EmptyPoint: Point = { x: 0, y: 0 };

export class DefaultMap extends Wiki {
  public nodeMap: { [key: string]: Point };

  constructor({ text = '', ...rest } = {}) {
    super(rest);

    try {
      this.nodeMap = JSON.parse(text);
    } catch (e) {
      console.warn(e);
      this.nodeMap = {};
    }
  }
}

export class TiddlyMap {
  private defaultMap: DefaultMap;
  private nodeMap: { [key: string]: Node };

  constructor(defaultMap: DefaultMap, nodeMap: { [key: string]: Node }) {
    this.defaultMap = clone(defaultMap);
    this.nodeMap = clone(nodeMap);
  }

  private guardNode(id: string) {
    if (!this.defaultMap.nodeMap[id]) {
      throw new Error(`node ${id} not found!`);
    }
  }

  public moveTo(id, p: Point = EmptyPoint) {
    this.guardNode(id);
    this.defaultMap.nodeMap[id] = p;
  }

  public position(id): Point {
    this.guardNode(id);
    return clone(this.defaultMap.nodeMap[id]);
  }
}