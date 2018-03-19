import { TEdge, Timestamp } from './tiddly-data';

export class Solution extends TEdge {
  constructor(id: string, to: string, created: Timestamp, modified: Timestamp) {
    super(
      id,
      to,
      'problem-solution:solution',
      '$:/plugins/felixhayashi/tiddlymap/graph/edgeTypes/problem-solution:solution',
      created,
      modified
    );
  }
}

export class Subproblem extends TEdge {
  constructor(id: string, to: string, created: Timestamp, modified: Timestamp) {
    super(
      id,
      to,
      'problem-solution:subproblem',
      '$:/plugins/felixhayashi/tiddlymap/graph/edgeTypes/problem-solution:subproblem',
      created,
      modified
    );

    this.description = 'A link from subproblem to parent-problem in problem-solution analysis graph.';
    this.style = { arrows: { to: { enabled: false } } }
  }
}