'use strict'

const path = require("path")
const log = console.log

import { importMarkdown, md2json } from "./index";

let bpath = '../test/fixtures/'
bpath = '../test/fixtures/ok-test-eng.md'

bpath = path.resolve(__dirname, bpath)
log('RUN BPATH:', bpath)

async function start(bpath) {
  let {mds, imgs} = await importMarkdown(bpath)
  // log('_LAST', mds.slice(-5))
  log('_mds:', mds.length)
  let docs = await md2json(mds)
  log('_docs:', docs)
}

start(bpath)

// md2json(bpath)
//   .then(res=> {
//     if (!res) returnn
//     log('_B-res', res.docs.length)
//     if (!res.docs) return
//     log('_LAST', res.docs.slice(-1))
//     res.docs.forEach(doc=> {
//       if (doc.level > -1) log('_title:', doc)
//     })
//   })
