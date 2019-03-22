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

const scriptData = (files, folder, file) => ({
  file,
  folder,
  path: path.join(folder, file),
  hasReadme: files.some(file => file.includes('README'))
})

const getScripts = () =>
  fs
    .readdir(__dirname)
    .then(files => files.filter(file => !file.startsWith('.')))
    .then(files =>
      Promise.all(
        files.map(maybeDir =>
          fs.stat(maybeDir).then(handle =>
            handle.isDirectory()
              ? fs
                  .readdir(maybeDir)
                  .then(files => [files, files.find(file => file.endsWith('.user.js'))])
                  .then(([files, file]) => file && scriptData(files, maybeDir, file))
              : void 0
          )
        )
      )
    )
    .then(scripts => scripts.filter(Boolean))
    .then(scripts =>
      Promise.all(
        scripts.map(script =>
          fs.readFile(script.path).then(buf => ({
            ...script,
            ...parseMeta(buf.toString())
          }))
        )
      )
    )

const baseUrl = 'https://github.com/fuzetsu/userscripts'
const tableHeader = '|Name|Links||\n|-|-|-|\n'

const formatScriptLine = script => {
  const installLink = `${baseUrl}/raw/master/${script.folder}/${script.file}`
  const infoLink = script.hasReadme && `${baseUrl}/tree/master/${script.folder}`
  return `|${script.name}|${
    infoLink ? `[Info](${infoLink})` : '_no readme_'
  }|[Install](${installLink})|`
}

const buildReadme = () =>
  getScripts()
    .then(scripts =>
      fs.readFile('README.template.md').then(buf =>
        buf
          .toString()
          .replace(
            '<SCRIPTS>',
            tableHeader +
              scripts
                .filter(script => script.deprecated !== 'true')
                .map(formatScriptLine)
                .join('\n')
          )
          .replace(
            '<UNMAINTAINED>',
            tableHeader +
              scripts
                .filter(script => script.deprecated === 'true')
                .map(formatScriptLine)
                .join('\n')
          )
      )
    )
    .then(readme => fs.writeFile('./README.md', readme))

buildReadme()
