'use strict'

const path = require("path")
const log = console.log

import { importMarkdown, md2json } from "./index";

let bpath = '../test/fixtures/'
bpath = '../test/fixtures/ok-test-eng.md'

bpath = path.resolve(__dirname, bpath)
log('RUN BPATH:', bpath)
let lang = 'eng'

async function start(bpath) {
  let {descr, mds, imgs} = await importMarkdown(bpath, lang)
  log('_descr:', descr)
  let docs = await md2json(mds, lang)
  let notes = docs.filter(doc=> doc.note)
  let endnotes = docs.filter(doc=> doc.endnote)

  log('_mds:', mds.length)
  log('_docs:', docs.length)
  log('_notes:', notes.length)
  log('_endnotes:', endnotes.length)
}

start(bpath)
