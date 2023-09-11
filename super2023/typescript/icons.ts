/** This file is part of Super Castle Game.
 * https://github.com/mvasilkov/super2023
 * @license GPLv3 | Copyright (c) 2023 Mark Vasilkov
 */
'use strict'

import { Palette, Settings, con } from './setup.js'
import { duckState } from './state.js'

const SVG_MUSIC = new Path2D('M20.18 23.93l18.55-6.67v11.08a7.65 7.65 0 0 0-3.82-1c-3.92 0-7.09 2.85-7.09 6.37 0 3.52 3.17 6.37 7.09 6.37 3.92 0 7.09-2.85 7.09-6.37V14.98c0-2.24 0-4.12-0.18-5.61a13.45 13.45 0 0 0-0.08-0.62c-0.17-1.02-0.47-1.98-1.05-2.77a4.49 4.49 0 0 0-1.35-1.24l-0.02-0.01c-1.54-0.92-3.28-0.86-5.06-0.44-1.73 0.4-3.87 1.2-6.5 2.19l-4.57 1.71c-1.23 0.46-2.27 0.85-3.09 1.26-0.87 0.43-1.62 0.94-2.19 1.71-0.56 0.76-0.8 1.58-0.9 2.46-0.1 0.84-0.1 1.85-0.1 3.05v15.59a7.65 7.65 0 0 0-3.82-1C9.17 31.26 6 34.11 6 37.63 6 41.15 9.17 44 13.09 44c3.92 0 7.09-2.85 7.09-6.37v-13.7Z')
const SVG_RESET = new Path2D('M6.93 6.93C4 9.86 4 14.57 4 24c0 9.43 0 14.14 2.93 17.07C9.86 44 14.57 44 24 44c9.43 0 14.14 0 17.07-2.93C44 38.14 44 33.43 44 24c0-9.43 0-14.14-2.93-17.07C38.14 4 33.43 4 24 4S9.86 4 6.93 6.93Zm11.59 9.02A1.5 1.5 0 1 0 16.48 13.74L11.98 17.9a1.5 1.5 0 0 0 0 2.2l4.5 4.16a1.5 1.5 0 1 0 2.04-2.21l-1.68-1.55h11.24a5.42 5.42 0 0 1 0 10.85H19a1.5 1.5 0 1 0 0 3h9.08a8.42 8.42 0 0 0 0-16.85h-11.24l1.68-1.55Z')
const SVG_BACK = new Path2D('M13.74 39c1.86 1 4.09 1 8.54 1h5.28c7.75 0 11.63 0 14.03-2.34C44 35.31 44 31.54 44 24c0-7.54 0-11.31-2.41-13.66C39.18 8 35.31 8 27.56 8h-5.27c-4.45 0-6.68 0-8.54 1-1.86 1-3.04 2.84-5.41 6.52L6.98 17.64C4.99 20.73 4 22.28 4 24c0 1.72 0.99 3.27 2.98 6.36l1.36 2.12c2.36 3.68 3.54 5.51 5.4 6.52Zm8.32-21.06A1.5 1.5 0 0 0 19.94 20.06L23.88 24l-3.94 3.94a1.5 1.5 0 1 0 2.12 2.12L26 26.12l3.94 3.94a1.5 1.5 0 0 0 2.12-2.12L28.12 24l3.94-3.94a1.5 1.5 0 0 0-2.12-2.12L26 21.88l-3.94-3.94Z')

export function renderIcons() {
    con.save()

    con.translate(Settings.SCREEN_WIDTH - 3 * Settings.ICON_SIZE - 2 * Settings.ICON_SPACING, 0)

    con.fillStyle = duckState.audioMuted ? Palette.ICON_INACTIVE : Palette.ICON
    con.fill(SVG_MUSIC)

    con.translate(Settings.ICON_SIZE + Settings.ICON_SPACING, 0)

    con.fillStyle = Palette.ICON
    con.fill(SVG_RESET, 'evenodd')

    con.translate(Settings.ICON_SIZE + Settings.ICON_SPACING, 0)

    con.fill(SVG_BACK, 'evenodd')

    con.restore()
}
