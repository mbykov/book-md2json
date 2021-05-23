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
  }

  if (!mds || !mds.length) return {descr: 'no file' + param}

  let reversed = []
  let level = 0
  let match

  let fnrefs = []
  let idx = 0
  let endnote = true

  mds.reverse().forEach(md=> {
    md = ndash(cleanStr(md))
    let doc =  {}
    if (/^\[/.test(md)) {
      match = md.match(/^\[([^\]]*)\]: /)
      if (match) {
        let refnote = match[1]
        doc.footnote = true
        if (endnote) doc.endnote = true
        // doc.ref = ['ref', refnote].join('-')
        doc.ref = refnote
        doc._id = ['ref', idx, refnote].join('-')
        fnrefs.push(doc)
      }
    } else if (/\[/.test(md)) {
      let regexp = /\[([^\]]*)\]/g
      let mdrefs = md.match(regexp)
      doc.refnotes = {}
      mdrefs.forEach(mdref=> {
        let refnote = mdref.replace(/[\[\]]/g, '')
        // let fndoc = fnrefs.find(doc=> ['ref', refnote].join('-') == doc.ref)
        let fndoc = fnrefs.find(doc=> refnote == doc.ref)
        if (!fndoc) return
        // if (fndoc) log('_________mdref_', refnote, fndoc.ref)
        // if (fndoc) doc.refnotes[refnote] = ['ref', fndoc.ref].join('-')
        if (fndoc) doc.refnotes[refnote] = fndoc._id, delete fndoc.ref
      })
    } else if (/^!\[/.test(md)) {
      doc.type = 'img'
    } else if (/^#/.test(md)){
      fnrefs = fnrefs.filter(fn=> fn.endnote)
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
    reversed.push(doc)
    idx++
  })

  for (let md of mds.reverse()) {
    continue
    md = ndash(cleanStr(md))
    let doc =  {}
    if (/^\[/.test(md)) {
      match = md.match(/^\[([^\]]*)\]: /)
      if (match) {
        let refnote = match[1]
        // log('_refnote', refnote)
        doc.footnote = true
        if (endnote) doc.endnote = true
        doc.ref = ['ref', refnote].join('-')
        fnrefs.push(doc)
      }
    } else if (/\[/.test(md)) {
      let regexp = /\[([^\]]*)\]/g
      let mdrefs = md.match(regexp)
      log('_REFS:', mdrefs)
      for (let mdref of mdrefs) {
        let refnote = mdref.replace(/[\[\]]/g, '')
        doc.refnotes = {}
        let fnref = fnrefs.find(doc=> ['ref', refnote].join('-') == doc.ref)
        if (!fnref) continue
        // log('_________mdref_', mdref, refnote, fnref.ref)
        if (fnref) doc.refnotes[refnote] = ['ref', fnref.ref].join('-')
      }
    } else if (/^!\[/.test(md)) {
      doc.type = 'img'
    } else if (/^#/.test(md)){
      fnrefs = fnrefs.filter(fn=> fn.endnote)
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
    reversed.push(doc)
    idx++
  }

  let docs = []

  let ulist = true
  for (let doc of reversed.reverse()) {
    if (!doc.md) {
      ulist = true
      continue
    }
    if (ulist && doc.type == 'list') doc.type = 'ulist', ulist = false
    docs.push(doc)
  }

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
    return [{err: errmess}]
  }

  let cleanstr = cleanStr(md)
  let mds = cleanstr.split('LINE-BREAK')
  // mds = _.compact(mds)
  let imgs = []
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
  return str.replace(/\n/g, 'LINE-BREAK').replace(/\r+/g, '').replace(/↵+/, '\n').replace(/\s\s+/g, ' ').replace(/[”“]/g, '"').trim() // replace(/  +/, ' ') // str.replace(/\n+/g, 'LINE-BREAK')
}

function ndash(str) {
  return str.trim().replace(/^- /, '– ').replace(/^--/, '–').replace(/^—/, '–').replace(/ - /g, ' – ') // m-dash: —
}
