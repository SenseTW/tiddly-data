# TiddlyData

Tools for processing wikitext files of TiddlyWiki. Plus more tools for nodes and edges of TiddlyMap.

# Usage

1. Clone this repo
2. `npm install` and `npm run build && npm link` under that folder
3. `npm link tiddly-data` under your TiddlyWiki/TiddlyMap folder
4. Use the `tiddly-map` command to manipulate your map
   * For example, `` `npm bin`/tiddly-map trello -b Lo01hfDB `` will fetch lists and cards from Trello board `Lo01hfDB` and update tid files in `./tiddlers/`.
   * You can change the target directory by using the `-d` option.

# ToDo

* [x] Model everything
  * [x] Wikitext
  * [x] Map node
  * [x] Map edge(optional)
* [x] Parse wikitext files
  * [x] ~~Find a parser~~
  * [x] Write a naive parser with [parsimmon][parsimmon]
* [x] Dump a TiddlyMap back to a folder
* [x] Create nodes from Trello cards
* [x] ~~Create nodes from Hypothes.is comments and highlights~~
* [x] Merge a existing TiddlyMap folder with a partial TiddlyMap
* [x] ~~Create a service instead of console tools~~
* [ ] Create a TiddlyWiki plugin instead of a console tool

[parsimmon]: https://github.com/jneen/parsimmon
