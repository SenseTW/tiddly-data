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

const API_LOCATION = 'http://api.trello.com/1';

const createTiddlyMapFromDirectory = async (directory: string) => {
  // states
  const file_map = {};
  const node_map: { [key: string]: D.Node } = {};
  let default_map, default_filter;

  const dir_path = path.resolve(directory);
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
  const default_filter_name = `${D.TIDDLY_MAP_PREFIX}_${D.TIDDLY_MAP_DEFAULT_FILTER_NAME}`;

  if (!file_map[default_map_name]) {
    throw new Error('default map not fonud!');
  }

  if (!file_map[default_filter_name]) {
    throw new Error('default filter not found!');
  }

  default_map = new D.DefaultMap(file_map[default_map_name]);
  default_filter = new D.DefaultFilter2(file_map[default_filter_name]);

  // check if every tmap exists
  for (const k in default_map.nodeMap) {
    if (!node_map[k]) {
      console.warn(`missing node: ${k}`);
    }
  }

  const tiddly_map = new D.TiddlyMap(default_map, default_filter, node_map);

  return tiddly_map;
}

const main = async (argv) => {
  const tm = await createTiddlyMapFromDirectory(argv.directory);
  console.log(JSON.stringify(tm.toFiles(), null, 2));
}

const getLabel = (card) => {
  for (const label of card.labels) {
    if (label.name === '政府與研究報告' || label.name === '外部意見') {
      return label.name;
    }
  }
  return '其他';
}

const template_map = {
  '政府與研究報告': 'document-quote',
  '外部意見': 'opinion-quote',
  '其他': 'document-quote'
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
    list.cards = {
      '政府與研究報告': [],
      '外部意見': [],
      '其他': []
    };
    list.position = { x: 20, y: 20 + 32 * i };
    list_map[list.id] = list;
    i++;
  }

  const { data: cards } = await axios.get(`${API_LOCATION}/boards/${argv.board}/cards`);
  for (const card of cards) {
    console.log('get source for card ' + card.shortUrl);
    const { data: attachments } = await axios.get(`${API_LOCATION}/cards/${card.id}/attachments`);
    const [a] = attachments;

    if (a && a.url) {
      card.source = a.url;
    }

    const l = getLabel(card);
    list_map[card.idList].cards[l].push(card);
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
        id: P.idFrom(list.id)
      },
      type: 'text/vnd.tiddlywiki',
      text: ''
    };

    for (const label of keys(template_map)) {
      if (list.cards[label].length) {
        raw.text += `! ${label}\n\n`;
      }

      for (const card of list.cards[label]) {
        // parse the card name to extract filename, comment preview and tags
        const title = T.Title.fromString(card.name);

        // remove '|' from the title for TiddlyWiki transclusion
        const name = '【' + title.name.replace(/\|/g, ' ') + '】' + title.preview;

        const raw_card = {
          created: now,
          modified: now,
          title: name,
          source: card.source,
          tags: title.tags.join(' '),
          tmap: {
            id: P.idFrom(card.id)
          },
          type: 'text/vnd.tiddlywiki',
          text: card.desc
        }

        // append the card link to the list node
        raw.text += '\n{{' + raw_card.title;
        if (template_map[label]) raw.text += '||' + template_map[label];
        raw.text += '}}\n';

        const node = new D.Node(raw_card);
        node_map[node.id] = node;
      }
    }

    const node = new D.Node(raw);
    position_map[node.id] = list.position;
    list_map[node.id] = node;
    node_map[node.id] = node;
  }

  const default_map = {
    created: now,
    modified: now,
    title: '$:/plugins/felixhayashi/tiddlymap/graph/views/Default/map',
    type: 'text/vnd.tiddlywiki',
    filter: '',
    text: `\n${JSON.stringify(position_map, null, 2)}`
  };

  const default_filter = {
    created: now,
    modified: now,
    title: '$:/plugins/felixhayashi/tiddlymap/graph/views/Default/filter/nodes',
    type: 'text/vnd.tiddlywiki',
    text: `\n${JSON.stringify(list_map, null, 2)}`
  }

  const tw = new D.TiddlyMap(new D.DefaultMap(default_map), new D.DefaultFilter(default_filter), node_map);

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
