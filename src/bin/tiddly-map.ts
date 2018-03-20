#!/usr/bin/env node
import * as path from 'path';
import { readdir, readFile } from 'fs-extra';
import * as yargs from 'yargs';
import * as D from '../tiddly-data';
import * as P from '../parser';

const argv = yargs
  .usage('Usage: $0 <command> [options]')
  .default('directory', 'tiddlers')
  .alias('d', 'directory')
  .argv;

const file_map: { [key: string]: D.Wiki } = {};

const main = async () => {
  const dir_path = path.resolve(argv.directory);
  const files = await readdir(dir_path);

  for (const file of files) {
    const file_path = path.resolve(dir_path, file);
    const data = await readFile(file_path, 'utf8');

    const raw = P.TiddlyFile.File.tryParse(data);
    file_map[file_path] = new D.Wiki(raw);
  }

  console.log(file_map);
}

main().catch(console.error.bind(console));
