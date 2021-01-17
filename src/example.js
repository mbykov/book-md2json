'use strict'

const path = require("path")
const log = console.log

import { md2json } from "./index";

let bpath = '../test/fixtures/'
let fn = 'ok-test-eng.md'
fn = 'markdown-test-eng.md'
// fn = 'Robinson-Crusoe.eng.md'
// fn = 'book_1.gr.aristotle.md'
// fn = 'Harry-Potter-and-the-Order-of-the-Phoenix.md'

bpath = path.resolve(__dirname, bpath, fn)
log('RUN BPATH:', bpath)
let lang = 'eng'

async function start(bpath) {
  let {descr, docs, imgs}  = await md2json(bpath)
  log('_descr:', descr)
  if (!docs) return
  let footnotes = docs.filter(doc=> doc.footnote)
  let endnotes = docs.filter(doc=> doc._id)
  let refs = docs.filter(doc=> doc.refnote)
  let headers = docs.filter(doc=> doc.level > -1)

  log('_docs:', docs)
  log('_footnotes:', footnotes.length)
  log('_endnotes:', endnotes.length)
  log('_refs:', refs.length)
  log('_headers:', headers)
}

start(bpath)
