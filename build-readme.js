const fs = require('fs').promises
const path = require('path')

const p = (...args) => (console.log(...args), args[0])

const parseMeta = script =>
  script
    .slice(script.indexOf('==UserScript=='), script.indexOf('==/UserScript=='))
    .split('\n')
    .map(line => line.match(/@([a-z]+)\s*([^\n]+)/i))
    .filter(match => match)
    .reduce((meta, [, key, value]) => Object.assign(meta, { [key]: value.trim() }), {})

const getScripts = () =>
  fs
    .readdir('.')
    .then(files => files.filter(file => !file.startsWith('.')))
    .then(files =>
      Promise.all(
        files.map(maybeDir =>
          fs.stat('./' + maybeDir).then(handle =>
            handle.isDirectory()
              ? fs
                  .readdir(maybeDir)
                  .then(files => files.find(file => file.endsWith('.user.js')))
                  .then(file => file && path.join(maybeDir, file))
              : void 0
          )
        )
      )
    )
    .then(files => files.filter(file => file))
    .then(files =>
      Promise.all(
        files.map(file =>
          fs.readFile(file).then(buf => ({
            path: file,
            file: path.basename(file),
            folder: path.dirname(file),
            ...parseMeta(buf.toString())
          }))
        )
      )
    )

const baseUrl = 'https://github.com/fuzetsu/userscripts'

const formatScriptLine = script =>
  `- [${script.name || p('NEEDS NAME', script)}](${baseUrl}/tree/master/${
    script.folder
  }) ~ [Install Now](${baseUrl}/raw/master/${script.folder}/${script.file})`

const buildReadme = () =>
  getScripts()
    .then(scripts =>
      `
      # Userscripts

      Various browser userscripts I created/maintain. Most are hosted on [greasyfork.org](greasyfork.org)
      where they can be installed.
      
      You can install the script here on github to always have the latest development version (links below).

      View more information about a particular script by clicking on its name.

      ### Regular Scripts

      ${scripts
        .filter(script => script.deprecated !== 'true')
        .map(formatScriptLine)
        .join('\n')}

      ### Utility Scripts

      - [Wait for Elements](https://greasyfork.org/en/scripts/5679-wait-for-elements)

      ### Ummaintained Scripts

      ${scripts
        .filter(script => script.deprecated === 'true')
        .map(formatScriptLine)
        .join('\n')}
      `
        .trim()
        .split('\n')
        .map(line => line.trim())
        .join('\n')
    )
    .then(readme => fs.writeFile('./README.md', readme))

buildReadme()
