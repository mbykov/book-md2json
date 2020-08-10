'use strict'

import _ from 'lodash'
const fse = require('fs-extra')
const path = require("path")
const log = console.log
// const franc = require('franc')
const naturalCompare = require("natural-compare-lite")

export async function md2json(mds, lang) {
  const fillsize = mds.length.toString().length
  let docs = []
  let level = 0, headstart = -1
  let levnumkey = {}, path = '00', counter = 0, filled, match
  let prevheader = {level: 0}
  let parent = {level: 0}

  let endnote = true
  for (let md of mds.reverse()) {
    let doc =  {_id: '', path: '', c: counter}
    if (/^\[/.test(md) && /^\[([^\]]*)\]: /.test(md)) {
      match = md.match(/^\[([^\]]*)\]: /)
      doc.note = true
      if (match) {
        if (endnote) doc.endnote = true
        doc.ref = match[1]
      }
    } else {
      endnote = false
    }
    counter++
    docs.push(doc)
  }
  log('_D', docs.reverse())

  // for (let md of mds) {
  //   let doc =  {_id: '', path: ''}
  //   if (/^#/.test(md)) {
  //     if (headstart < 0) headstart = md.match(/#/g).length - 1
  //     level = md.match(/#/g).length - headstart
  //     doc.level = level
  //     md = md.replace(/#/g, '')
  //   }

  //   // todo: последовательность cleanStr и ndash ?
  //   // найти notes сначала, потом обработать?
  //   md = cleanStr(md)
  //   if (!md) { log('_NO ROW', md); continue }
  //   md = ndash(cleanStr(md))

  //   if (doc.level > -1) {
  //     level = doc.level
  //     counter = 0
  //     if (levnumkey[level] > -1) levnumkey[level] += 1
  //     else levnumkey[level] = 0
  //     doc.levnum = levnumkey[level] || 0

  //     if (prevheader.level === level) path = [prevheader.path.slice(0,-1), levnumkey[level]].join('')
  //     else if (prevheader.level < level) levnumkey[level] = 0, path = [prevheader.path, level, levnumkey[level]].join('')
  //     else if (prevheader.level > level) {
  //       parent = _.last(_.filter(docs, (bdoc, idy)=> { return bdoc.level < doc.level  })) || {level: 0, path: '00'}
  //       path = [parent.path, level, levnumkey[level]].join('')
  //     }
  //     prevheader = doc
  //   }

  //   doc.path = path
  //   filled = zerofill(counter, fillsize)
  //   if (/^-/.test(md)) md = md.replace(/^-/, '').trim(), doc.type = 'list'
  //   doc.lang = lang

  //   let notepath = path
  //   // footnotes, endnotes:
  //   if (/^\[/.test(md)) {
  //     match = md.match(/^\[([^\]]*)\]: /)
  //     if (match) {
  //       doc.type = 'note'
  //       let ref = match[1]
  //       // log('__match1=>', match, 'md:', md)
  //       let refpath = ref.split(':')[1]
  //       if (refpath) {
  //         notepath = refpath
  //         md = md.replace(':'+refpath, '')
  //         // doc.ref = notepath
  //       }
  //       filled = ref.split(':')[0]
  //       notepath = ['ref', notepath].join('-')
  //     }

  //     // note-sign in paragraph
  //   } else if (/\[/.test(md)) {
  //     // log('__match-note__=>md:', md)
  //     match = md.match(/\[([^\]]*)\]/)
  //     if (match) {
  //       // doc.type = 'note'
  //       let ref = match[1]
  //       // log('__match2=>', match, 'md:', md)
  //       let refpath = ref.split(':')[1]
  //       if (refpath) {
  //         md = md.replace(':'+refpath, '')
  //         doc.ref = refpath
  //       }
  //       // filled = ref.split(':')[0]
  //     }

  //   } else if (/^!\[/.test(md)) {
  //     doc.type = 'img'
  //   // } else {
  //   }
  //   doc._id = [notepath, filled].join('-')
  //   doc.md = md

    // counter++
    // prevheader.size = counter
    // docs.push(doc)
  // }

  return docs
}

export async function importMarkdown(bpath, lang) {
  let md = ''
  try {
    let stats = fse.statSync(bpath)
    if (stats.isDirectory()) md += await readDir(bpath)
    else md += await fse.readFile(bpath, 'utf-8')
  } catch(err) {
    let errmess = 'something wrong with ' + bpath
    return {err: errmess}
  }

  let cleanstr = cleanStr(md.trim())
  let mds = cleanstr.split(/\n+/)

  let imgs = []
  let descr = {type: 'type', lang: lang, author: 'author', title: 'title'}
  return {descr, mds, imgs}
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
