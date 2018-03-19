export type Timestamp = number;

export class Wiki {
  public type: string = 'text/vnd.tiddlywiki';

  public created: Timestamp;

  public modified: Timestamp;

  public title: string;

  constructor(title: string, created: Timestamp, modified: Timestamp = created) {
    this.title = title;
    this.created = created;
    this.modified = modified;
  }
}