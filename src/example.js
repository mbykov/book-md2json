'use strict'

const path = require("path")
const log = console.log

import { md2json } from "./index";

let bpath = '../test'
let fn = 'ok-test-eng.md'
// fn = 'divina-commedia.rus.md'

bpath = path.resolve(__dirname, bpath, fn)
log('RUN BPATH:', bpath)

async function start(bpath) {
  let {descr, docs, imgs}  = await md2json(bpath)
  log('_descr:', descr)

  log('_docs:', docs.slice(4,6))
  log('_docs:', docs.length)
}

start(bpath)
