#!/usr/bin/env node
import * as path from 'path';
import { readdir, readFile, outputFile } from 'fs-extra';
import * as yargs from 'yargs';
import axios from 'axios';
import * as momnet from 'moment';
import * as uuidv5 from 'uuid/v5';
import { keys } from 'ramda';
import * as D from '../tiddly-data';
import * as P from '../parser';
import * as T from '../trello';

const NAMESPACE = '2cb5cecd-1bab-4a9a-82f9-a1ece125cfc5';
const API_LOCATION = 'http://api.trello.com/1';

const main = async (argv) => {
  // states
  const file_map = {};
  const node_map: { [key: string]: D.Node } = {};
  let default_map

  const dir_path = path.resolve(argv.directory);
  const files = await readdir(dir_path);

  // read all tid files from the target directory
  for (const file of files) {
    if (!/.tid$/.test(file)) continue;

    const file_path = path.resolve(dir_path, file);
    const data = await readFile(file_path, 'utf8');

    const raw = P.TiddlyFile.File.tryParse(data);
    file_map[file] = raw;

    if (raw.tmap && raw.tmap.id) {
      node_map[raw.tmap.id] = new D.Node(raw);
    }
  }

  // find the default map
  const default_map_name = `${D.TIDDLY_MAP_PREFIX}_${D.TIDDLY_MAP_DEFAULT_MAP_NAME}`;

  if (!file_map[default_map_name]) {
    throw new Error('default map not fonud!');
  }

  default_map = new D.DefaultMap(file_map[default_map_name])

  // check if every tmap exists
  for (const k in default_map.nodeMap) {
    if (!node_map[k]) {
      console.warn(`missing node: ${k}`);
    }
  }

  const tiddly_map = new D.TiddlyMap(default_map, node_map);

  console.log(keys(tiddly_map.toFiles()));
}

const trello = async (argv) => {
  const now = momnet().format(D.TIME_FORMAT);

  // states
  const position_map = {};
  const node_map = {};
  const list_map = {};
  const card_map = {};

  const { data: lists } = await axios.get(`${API_LOCATION}/boards/${argv.board}/lists`);
  let i = 0;
  for (const list of lists) {
    list.cards = [];
    list.position = { x: 20, y: 20 + 32 * i };
    list_map[list.id] = list;
    i++;
  }

  const { data: cards } = await axios.get(`${API_LOCATION}/boards/${argv.board}/cards`);
  for (const card of cards) {
    list_map[card.idList].cards.push(card);
    card_map[card.id] = card;
  }

  // create wikis from lists
  for (const list of lists) {
    const raw = {
      created: now,
      modified: now,
      title: list.name,
      tags: '',
      tmap: {
        id: uuidv5(list.id, NAMESPACE)
      },
      type: 'text/vnd.tiddlywiki',
      text: ''
    };

    for (const card of list.cards) {
      const title = T.Title.fromString(card.name);
      const raw_card = {
        created: now,
        modified: now,
        title: title.name,
        tags: title.tags.join(' '),
        tmap: {
          id: uuidv5(card.id, NAMESPACE)
        },
        type: 'text/vnd.tiddlywiki',
        text: card.desc
      }

      raw.text += '\n{{' + title.name + '||document-quote}}\n';

      const node = new D.Node(raw_card);
      node_map[node.id] = node;
    }

    const node = new D.Node(raw);
    position_map[node.id] = list.position;
    node_map[node.id] = node;
  }

  const default_map = {
    created: now,
    modified: now,
    title: '$:/plugins/felixhayashi/tiddlymap/graph/views/Default/map',
    type: 'text/vnd.tiddlywiki',
    text: `\n${JSON.stringify(position_map, null, 2)}`
  };

  const tw = new D.TiddlyMap(new D.DefaultMap(default_map), node_map);

  const files = tw.toFiles();
  console.log(`fetch board ${argv.board} to ${argv.directory}/`);
  for (const filename in files) {
    const filepath = path.resolve(argv.directory, filename);
    console.log(`  ${filename}`);
    await outputFile(filepath, files[filename]);
  }
}

yargs
  .usage('Usage: $0 <command> [options]')
  .command({
    command: '$0',
    describe: 'Check TiddlyMap nodes',
    builder: (yargs) =>
      yargs
        .example('$0 --directory temp', 'Check tid files in ./temp')
        .alias('d', 'directory')
        .nargs('d', 1)
        .describe('d', 'Target directory')
        .default('d', 'tiddlers'),
    handler: main
  })
  .command({
    command: 'trello',
    describe: 'Dump Trello cards to TiddlyMap nodes',
    builder: (yargs) =>
      yargs
        .example('$0 trello --board Lo01hfDB --directory temp', 'dump Trello cards from board Lo01hfDB to ./temp')
        .alias('d', 'directory')
        .nargs('d', 1)
        .describe('d', 'Target directory')
        .default('d', 'tiddlers')
        .alias('b', 'board')
        .nargs('b', 1)
        .describe('b', 'Trello board ID')
        .demandOption(['board']),
    handler: trello
  })
  .help()
  .argv;
