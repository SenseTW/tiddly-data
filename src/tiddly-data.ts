import * as moment from 'moment';

const TIME_FORMAT = 'YYYYMMDDHHmmssSSS';

export class Wiki {
  public type: string = 'text/vnd.tiddlywiki';

  public created: moment.Moment;

  public modified: moment.Moment;

  public title: string;

  public description?: string;

  public style?: object;

  constructor(title: string, created: string, modified: string = created) {
    this.title = title;
    this.created = moment.utc(created, TIME_FORMAT, true); // strict mode
    this.modified = moment.utc(modified, TIME_FORMAT, true);
  }
}

export class Edge extends Wiki {
  public id: string;

  public type: string;

  public to: string;

  constructor(id: string, to: string, type: string, title: string, created: string, modified: string) {
    super(title, created, modified);

    this.id = id;
    this.to = to;
    this.type = type;
  }
}

export class Node extends Wiki {
  public edges: any[] = [];

  public id: string;

  constructor(id: string, title: string, created: string, modified: string) {
    super(title, created, modified);

    this.id = id;
  }
}