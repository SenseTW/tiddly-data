# TiddlyData

Tools for processing wikitext files of TiddlyWiki. Plus more tools for nodes and edges of TiddlyMap.

# Usage

1. Clone this repo
2. `npm install` and `npm link` under that folder
3. `npm link tiddly-data` under your TiddlyWiki/TiddlyMap folder
4. Use the `tiddly-map` command to manipulate your map
   * For example, `` `npm bin`/tiddly-map trello -b Lo01hfDB -d temp `` will fetch lists and cards from Trello board `Lo01hfDB` and save as tid files to `./temp/`.

# ToDo

* [ ] Model everything
  * [x] Wikitext
  * [x] Map node
  * [ ] Map edge(optional)
* [x] Parse wikitext files
  * [x] ~~Find a parser~~
  * [x] Write a naive parser with [parsimmon][parsimmon]
* [ ] Dump a TiddlyMap back to a folder
* [ ] Create nodes from Trello cards
* [ ] Create nodes from Hypothes.is comments and highlights
* [ ] Merge a existing TiddlyMap folder with a partial TiddlyMap
* [ ] Create a service instead of console tools

[parsimmon]: https://github.com/jneen/parsimmon