export type Timestamp = number;

export class Wiki {
  public type: string = 'text/vnd.tiddlywiki';

  public created: Timestamp;

  public modified: Timestamp;

  public title: string;

  public description?: string;

  public style?: object;

  constructor(title: string, created: Timestamp, modified: Timestamp = created) {
    this.title = title;
    this.created = created;
    this.modified = modified;
  }
}

export class Edge extends Wiki {
  public id: string;

  public type: string;

  public to: string;

  constructor(id: string, to: string, type: string, title: string, created: Timestamp, modified: Timestamp) {
    super(title, created, modified);

    this.id = id;
    this.to = to;
    this.type = type;
  }
}

export class Node extends Wiki {
  public edges: any[] = [];

  public id: string;

  constructor(id: string, title: string, created: Timestamp, modified: Timestamp) {
    super(title, created, modified);

    this.id = id;
  }
}