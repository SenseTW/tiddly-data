#!/usr/bin/env node
import * as path from 'path';
import { readdir, readFile } from 'fs-extra';
import * as yargs from 'yargs';
import * as D from '../tiddly-data';
import * as P from '../parser';
import { keys } from 'ramda';

const TIDDLY_MAP_PREFIX = '$__plugins_felixhayashi_tiddlymap';

const argv = yargs
  .usage('Usage: $0 <command> [options]')
  .default('directory', 'tiddlers')
  .alias('d', 'directory')
  .argv;

// states
const file_map = {};
const node_map: { [key: string]: D.Node } = {};
let default_map

const main = async () => {
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
  const default_map_name = `${TIDDLY_MAP_PREFIX}_graph_views_Default_map.tid`;

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

  console.log(default_map);
}

main().catch(console.error.bind(console));
