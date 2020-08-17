'use strict'

import _ from 'lodash'
const fse = require('fs-extra')
const path = require("path")
const log = console.log
// const franc = require('franc')
const naturalCompare = require("natural-compare-lite")

export async function md2json(bpath) {
  let descr = {type: 'type', author: 'author', title: 'title'}
  let {mds, imgs} = await importMarkdown(bpath)

  if (!mds || !mds.length) return {descr: 'no file' + bpath}

  // const fillsize = mds.length.toString().length
  let docs = []
  let level = 0
  let match

  let endnotes = []
  let endnote = true

  for (let md of mds.reverse()) {
    if (!md) continue
    md = ndash(cleanStr(md))
    let doc =  {}

    if (/^\[/.test(md)) {
      match = md.match(/^\[([^\]]*)\]: /)
      doc.footnote = true
      if (match) {
        let refnote = match[1]
        doc.refnote = refnote
        if (endnote) {
          endnotes.push(refnote)
          doc._id = ['ref', refnote].join('-')
        }
      }
    } else if (/\[/.test(md)) {
      match = md.match(/\[([^\]]*)\]/)
      if (match) {
        let refnote = match[1]
        if (endnotes.includes(refnote)) {
          if (!doc.refnote) doc.refnote = {}
          doc.refnote[refnote] = ['ref', refnote].join('-')
        }
      }
    } else if (/^!\[/.test(md)) {
      doc.type = 'img'
    } else {
      endnote = false
    }

    if (/^#/.test(md)) {
      level = md.match(/#/g).length
      doc.level = level
      md = md.replace(/#/g, '').trim()
    }
    doc.md = md
    docs.push(doc)
  }

  docs = docs.reverse()
  return { descr, docs, imgs }
}

export async function importMarkdown(bpath) {
  let md = ''
  try {
    let stats = fse.statSync(bpath)
    if (stats.isDirectory()) md += await readDir(bpath)
    else md += await fse.readFile(bpath, 'utf-8')
  } catch(err) {
    let errmess = 'something wrong with ' + bpath
    return {err: errmess}
  }

  let cleanstr = cleanStr(md)
  log('_STR', cleanstr.length)
  let mds = cleanstr.split(/\n+/)
  log('_MDS', mds.length)
  let imgs = []
  return {mds: mds, imgs: imgs}
}


async function readDir(bpath) {
  let md = ''
  let fns = await fse.readdir(bpath)
  fns.sort(function(a, b){
    return naturalCompare(a.toLowerCase(), b.toLowerCase())
  })
  for (const fn of fns) {
    let filepath = path.resolve(bpath, fn)
    const stats = fse.statSync(filepath)
    // log('_FP', fn)
    if (stats.isDirectory()) md += await readDir(filepath)
    else md += await fse.readFile(filepath, 'utf-8')
  }
  // log('_FP-md', bpath, md.length)
  return md
}

export function cleanStr(str) {
  return str.replace(/\n+/, '\n').replace(/↵+/, '\n').replace(/  +/, ' ').trim()
}

// function guessLang(docs) {
//   let test = docs.map(doc=> doc._id).join(' ')
//   return franc(test)
// }


function ndash(str) {
  return str.trim().replace(/^--/, '–').replace(/^—/, '–').replace(/ - /g, ' – ') // m-dash: —
}

function zerofill(number, size) {
  number = number.toString()
  while (number.length < size) number = "0" + number
  return number
}
