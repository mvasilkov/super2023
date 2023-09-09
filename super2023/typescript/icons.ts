/** This file is part of Super Castle Game.
 * https://github.com/mvasilkov/super2023
 * @license GPLv3 | Copyright (c) 2023 Mark Vasilkov
 */
'use strict'

import { Palette, Settings, con } from './setup.js'
import { duckState } from './state.js'

const SVG_MUSIC = new Path2D('m10.09 11.963l9.274-3.332v5.54a3.825 3.825 0 0 0-1.91-.501c-1.958 0-3.545 1.426-3.545 3.185c0 1.759 1.587 3.185 3.545 3.185c1.959 0 3.546-1.426 3.546-3.185V7.492c0-1.12 0-2.059-.088-2.807a6.724 6.724 0 0 0-.043-.31c-.084-.51-.234-.988-.522-1.386a2.244 2.244 0 0 0-.676-.617l-.009-.005c-.771-.461-1.639-.428-2.532-.224c-.864.198-1.936.6-3.25 1.095l-2.284.859c-.615.231-1.137.427-1.547.63c-.435.216-.81.471-1.092.851c-.281.38-.398.79-.452 1.234c-.05.418-.05.926-.05 1.525v7.794a3.825 3.825 0 0 0-1.91-.501C4.587 15.63 3 17.056 3 18.815C3 20.574 4.587 22 6.545 22c1.959 0 3.546-1.426 3.546-3.185v-6.852Z')
const SVG_RESET = new Path2D('M3.464 3.464C2 4.93 2 7.286 2 12c0 4.714 0 7.071 1.464 8.535C4.93 22 7.286 22 12 22c4.714 0 7.071 0 8.535-1.465C22 19.072 22 16.715 22 12c0-4.714 0-7.071-1.465-8.536C19.072 2 16.714 2 12 2S4.929 2 3.464 3.464Zm5.795 4.51A.75.75 0 1 0 8.24 6.872L5.99 8.949a.75.75 0 0 0 0 1.102l2.25 2.077a.75.75 0 1 0 1.018-1.102l-.84-.776h5.62a2.712 2.712 0 0 1 0 5.423H9.5a.75.75 0 1 0 0 1.5h4.539a4.212 4.212 0 0 0 0-8.423h-5.62l.84-.776Z')
const SVG_BACK = new Path2D('M6.871 19.499c.93.501 2.044.501 4.271.501h2.637c3.875 0 5.813 0 7.017-1.172C22 17.657 22 15.771 22 12c0-3.771 0-5.657-1.204-6.828C19.592 4 17.654 4 13.78 4h-2.637c-2.227 0-3.341 0-4.27.501c-.93.502-1.52 1.42-2.701 3.259L3.49 8.82C2.497 10.366 2 11.14 2 12c0 .86.497 1.634 1.49 3.18l.68 1.06c1.181 1.838 1.771 2.757 2.701 3.259Zm4.16-10.53A.75.75 0 0 0 9.97 10.03L11.94 12l-1.97 1.97a.75.75 0 1 0 1.06 1.06L13 13.06l1.97 1.97a.75.75 0 0 0 1.06-1.06L14.06 12l1.97-1.97a.75.75 0 0 0-1.06-1.06L13 10.94l-1.97-1.97Z')

export function renderIcons() {
    con.save()

    con.scale(Settings.ICON_SCALE, Settings.ICON_SCALE)
    con.translate(Settings.SCREEN_WIDTH / Settings.ICON_SCALE - 3 * Settings.ICON_SIZE - 2 * Settings.ICON_SPACING, 0)

    con.fillStyle = duckState.audioMuted ? Palette.ICON_INACTIVE : Palette.ICON
    con.fill(SVG_MUSIC)

    con.translate(Settings.ICON_SIZE + Settings.ICON_SPACING, 0)

    con.fillStyle = Palette.ICON
    con.fill(SVG_RESET, 'evenodd')

    con.translate(Settings.ICON_SIZE + Settings.ICON_SPACING, 0)

    con.fill(SVG_BACK, 'evenodd')

    con.restore()
}
