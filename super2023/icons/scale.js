const fs = require('node:fs')
const { XMLParser } = require('fast-xml-parser')
const svgpath = require('svgpath')

const FILES = [
    'SolarMusicNoteBold.svg',
    'SolarUndoLeftRoundSquareBold.svg',
    'SolarBackspaceBold.svg',
]

const VAR_NAMES = [
    'SVG_MUSIC',
    'SVG_RESET',
    'SVG_BACK',
]

for (let n = 0; n < FILES.length; ++n) {
    const file = FILES[n]
    const variable = VAR_NAMES[n]

    console.log(`Reading ${file} (${variable})`)

    const svg = fs.readFileSync(`${__dirname}/${file}`, { encoding: 'utf-8' })
    const parser = new XMLParser({
        attributeNamePrefix: '@_',
        ignoreAttributes: false,
    })
    const json = parser.parse(svg)
    const path = json.svg.path
    let d = path['@_d']

    d = svgpath(d).scale(2).round(2).toString()

    console.log('---')
    console.log(`const ${variable} = new Path2D('${d}')`)
    console.log(`--- (size: ${d.length})`)
}
