import * as objectAssign from 'object-assign';
import * as moment from 'moment';
import { keys, clone, is, findIndex } from 'ramda';
import { idFrom, flattenObject } from './parser';
import * as F from './tiddly-filter';

export const TIME_FORMAT = 'YYYYMMDDHHmmssSSS';

const rawToString = ({ text = '', type = '', ...rest } = {}): string => {
    let s = '';

    const flatted = flattenObject(rest);
    for (const k in flatted) {
      const v = flatted[k]
      if (v === undefined) continue;
      s += `${k}: ${v.toString().replace(/\n/g, '')}\n`;
    }

    // type should be the last value before the text
    if (type) {
      s += `type: ${type}\n`;
    }

    if (text) {
      if (/\n/.test(text)) {
        s += '\n' + text;
      } else {
        s += `text: ${text}`;
      }
    }

    return s;
};

export class Wiki {
  private keys: string[];

  public type: string;
  public created: moment.Moment;
  public modified: moment.Moment;
  public title?: string;
  public text?: string;
  public description?: string;
  public style?: string;

  constructor({ created = '', modified = '', ...rest } = {}) {
    // remember keys from the raw object :(
    this.keys = keys(rest);
    this.created = moment.utc(created, TIME_FORMAT);
    this.modified = moment.utc(modified, TIME_FORMAT);

    objectAssign(this, rest);
  }

  public toObject(): any {
    const { created, modified } = this;
    let r: any = {};

    if (created) {
      r.created = this.created.format(TIME_FORMAT);
    }

    if (modified) {
      r.modified = this.modified.format(TIME_FORMAT);
    }

    for (const k of this.keys) {
      if (is(Function, this[k])) continue;
      r[k] = this[k];
    }

    return r;
  }

  public toString():string {
    return rawToString(this.toObject());
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

  public toString(): string {
    let o = this.toObject();

    o.tmap = {
      // order matters
      edges: JSON.stringify(this.edges),
      id: this.id
    };

    return rawToString(o);
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

  public toString(): string {
    let o = this.toObject();

    o.text = JSON.stringify(this.nodeMap, null, 2);

    return rawToString(o);
  }
}

export const TIDDLY_MAP_PREFIX = '$__plugins_felixhayashi_tiddlymap';
export const TIDDLY_MAP_DEFAULT_MAP_NAME = 'graph_views_Default_map.tid';
export const TIDDLY_MAP_DEFAULT_FILTER_NAME = 'graph_views_Default_filter_nodes.tid';

export class DefaultFilter extends Wiki {
  public nodeMap: { [key: string]: Point };

  constructor({ text = '{}', ...rest } = {}) {
    super(rest);

    try {
      this.nodeMap = JSON.parse(text);
    } catch (e) {
      console.warn(e);
      this.nodeMap = {};
    }
  }

  public toString(): string {
    let o = this.toObject();
    o.filter = Object.keys(this.nodeMap)
        .filter(id => this.nodeMap[id]['title'])
        // XXX: filter them somewhere else
        .filter(id => this.nodeMap[id]['title'].search('Inbox -') != 0)
        .map(id => `[field:tmap.id[${id}]]`)
        .join(' ');
    return rawToString(o);
  }
}

export class DefaultFilter2 extends Wiki {
  private filter: F.Expression[];

  constructor({ filter =  '', ...rest }) {
    super(rest);

    try {
      this.filter = F.fromString(filter);
    } catch (e) {
      console.warn(e);
      this.filter = [];
    }
  }

  public toString(): string {
    let o = this.toObject();
    o.filter = F.toString(this.filter);
    return rawToString(o);
  }

  private getIndex = (id: string) => ({ run }: F.Expression) => {
    if (typeof run === 'string') return false;
    const [{ parameter: { value } }] = run;
    return value === id;
  }

  public push(id: string) {
    // check if the id is already exist
    const i = findIndex(
      this.getIndex(id),
      this.filter
    );

    if (i !== -1) return;

    const e: F.Expression = {
      run: [{
        negate: false,
        operator: 'field',
        suffix: 'tmap.id',
        parameter: {
          type: 'hard',
          value: id
        }
      }]
    }

    this.filter.push(e);
  }

  public removeById(id: string) {
    const i = findIndex(this.getIndex(id), this.filter);
    if (i === -1) return;
    this.filter = [
      ...this.filter.slice(0, i),
      ...this.filter.slice(i + 1)
    ]
  }
}

export class TiddlyMap {
  private defaultMap: DefaultMap;
  private defaultFilter: DefaultFilter2;
  private nodeMap: { [key: string]: Node };

  constructor(defaultMap: DefaultMap, defaultFilter: DefaultFilter2, nodeMap: { [key: string]: Node }) {
    this.defaultMap = clone(defaultMap);
    this.defaultFilter = clone(defaultFilter);
    this.nodeMap = clone(nodeMap);
  }

  private guardNode(id: string) {
    if (!this.defaultMap.nodeMap[id]) {
      throw new Error(`node ${id} not found!`);
    }
  }

  /*
  public getDefaultMap(): DefaultMap {
    return this.defaultMap;
  }

  public getDefaultFilter(): DefaultFilter2 {
    return this.defaultFilter;
  }
  */

  public getNode(id: string): Node {
    return this.nodeMap[id];
  }

  public moveTo(id: string, p: Point = EmptyPoint) {
    this.guardNode(id);
    this.defaultMap.nodeMap[id] = p;
  }

  public position(id): Point {
    return clone(this.defaultMap.nodeMap[id]);
  }

  public add(node: Node, p?: Point) {
    this.nodeMap[node.id] = node;

    // show the node if it comes with its coordinate
    if (p) {
      this.defaultMap.nodeMap[node.id] = p;
      this.defaultFilter.push(node.id);
    }
  }

  public update(node: Node, p?: Point) {
    this.nodeMap[node.id] = node;

    if (p) {
      this.defaultMap.nodeMap[node.id] = p;
    }
  }

  public remove(node: Node) {
    this.nodeMap[node.id] = undefined;
    delete this.nodeMap[node.id];
    this.defaultMap.nodeMap[node.id] = undefined;
    delete this.defaultMap.nodeMap[node.id];
    this.defaultFilter.removeById(node.id);
  }

  public toFiles(): { [key: string]: string } {
    let r: { [key: string]: string } = {};

    r[`${TIDDLY_MAP_PREFIX}_${TIDDLY_MAP_DEFAULT_MAP_NAME}`] = this.defaultMap.toString();
    r[`${TIDDLY_MAP_PREFIX}_${TIDDLY_MAP_DEFAULT_FILTER_NAME}`] = this.defaultFilter.toString();

    for (const k in this.nodeMap) {
      const v = this.nodeMap[k];
      // escape slashes
      const filename = (v.title || k).replace(/\//g, '%2F');
      r[`${filename}.tid`] = v.toString();
    }

    return r;
  }
}
