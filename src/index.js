'use strict'

import _ from 'lodash'
const fse = require('fs-extra')
const path = require("path")
const log = console.log
const naturalCompare = require("natural-compare-lite")

export async function md2json(param, imgs) {
  let mds
  if (_.isString(param)) {
    [mds, imgs] = await importMarkdown(param)
  } else if (_.isArray(param)) {
    mds = param
    // log('_md2json', mds.length)
  }

  if (!mds || !mds.length) return {descr: 'no file' + param}

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
      // match = md.match(reFnSign)
      if (match) {
        let refnote = match[1]
        doc.refnote = refnote
        doc.footnote = true
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
    else if (/^-[^ ]/.test(md)) {
      md = md.replace(/^-/, '')
      doc.type = 'list'
    } else if (/^\d/.test(md)) {
        md = '&nbsp;' + md
    }
    doc.md = md
    docs.push(doc)
  }

  docs = docs.reverse()
  log('_md2json-docs', docs.length)
  let descr = {type: 'md', author: 'author', title: 'title'}
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
  let mds = cleanstr.split('LINE-BREAK')
  mds = _.compact(mds)
  let imgs = []
  // return {mds: mds, imgs: imgs}
  return [mds, imgs]
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
    if (stats.isDirectory()) md += await readDir(filepath)
    else md += await fse.readFile(filepath, 'utf-8')
  }
  return md
}

export function cleanStr(str) {
  return str.replace(/\n+/g, 'LINE-BREAK').replace(/\r+/g, '').replace(/↵+/, '\n').replace(/\s\s+/g, ' ').replace(/[”“]/g, '"').trim() // replace(/  +/, ' ')
}

function ndash(str) {
  return str.trim().replace(/^- /, '– ').replace(/^--/, '–').replace(/^—/, '–').replace(/ - /g, ' – ') // m-dash: —
}
