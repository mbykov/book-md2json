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
  let {descr, docs, imgs}  = await md2json(bpath)
  log('_descr:', descr)
  let notes = docs.filter(doc=> doc.note)
  let endnotes = docs.filter(doc=> doc.endnote)
  let hasendnotes = docs.filter(doc=> doc.endnotes)

  log('_docs:', docs.length)
  log('_notes:', notes.length)
  log('_endnotes:', endnotes.length)
  log('_hasendnotes:', hasendnotes.length)
}

start(bpath)
