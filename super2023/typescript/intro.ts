/** This file is part of Super Castle Game.
 * https://github.com/mvasilkov/super2023
 * @license GPLv3 | Copyright (c) 2023 Mark Vasilkov
 */
'use strict'

import { easeInOutQuad, easeOutQuad, lerp } from '../node_modules/natlib/interpolation.js'
import { interpolatePhase } from '../node_modules/natlib/state.js'
import { renderCastle } from './castle.js'
import { printCenter } from './print.js'
import { Palette, Settings, con } from './setup.js'
import { DuckPhase, duckState } from './state.js'

export function renderIntro(t: number, tOscillator: number) {
    const t0 = interpolatePhase(duckState, duckState.phase === DuckPhase.TITLE_SCREEN ? Settings.TITLE_ENTER_DURATION : Settings.LEAVE_DURATION, t)

    t = easeInOutQuad(t0)

    con.fillStyle = Palette.INTRO_2
    con.fillRect(0, 0.5 * (1 - t) * Settings.SCREEN_HEIGHT,
        Settings.SCREEN_WIDTH, t * Settings.SCREEN_HEIGHT)

    renderCastle(t, 1)

    con.beginPath()
    printCenter(0.5 * Settings.SCREEN_WIDTH, lerp(-20, 0.25 * Settings.SCREEN_HEIGHT, easeOutQuad(t0)), 6, 'SUPER CASTLE GAME', 1.5, tOscillator)
    // con.lineWidth = 3
    // con.strokeStyle = Palette.NOTHING
    // con.stroke()
    con.shadowColor = Palette.BOARD
    con.shadowOffsetX = con.shadowOffsetY = 3
    con.fillStyle = Palette.INTRO
    con.fill()

    if (duckState.phase === DuckPhase.TITLE_SCREEN) {
        const top = lerp(Settings.SCREEN_HEIGHT + 90, 0.75 * Settings.SCREEN_HEIGHT, easeOutQuad(t0))
        const left = 210 // .Inline(2)
        const right = Settings.SCREEN_WIDTH - 210 // .Inline(3)

        con.beginPath()
        con.rect(left - 150, top - 80, 300, 160)
        con.rect(right - 150, top - 80, 300, 160)
        con.fillStyle = Palette.BUTTON
        con.fill()

        con.beginPath()
        printCenter(left, top, 6, 'START', 1, tOscillator)

        printCenter(right, top - 0.05 * Settings.SCREEN_HEIGHT, 6, 'START', 1, tOscillator)
        printCenter(right, top + 0.05 * Settings.SCREEN_HEIGHT, 4, 'MUSIC OFF', 1, tOscillator)
        con.shadowColor = Palette.BUTTON_3
        con.fillStyle = Palette.BUTTON_2
        con.fill()
    }

    con.shadowColor = '#0000'
    con.shadowOffsetX = con.shadowOffsetY = 0
}

export function renderIntroEnd(t: number, tOscillator: number) {
    t = easeInOutQuad(interpolatePhase(duckState, Settings.ENTER_DURATION, t))

    con.save()

    con.rect(0.5 * t * Settings.SCREEN_WIDTH, 0,
        (1 - t) * Settings.SCREEN_WIDTH, Settings.SCREEN_HEIGHT)
    con.fillStyle = Palette.INTRO_2
    con.fill()
    con.clip()

    renderCastle(1, 1)

    con.beginPath()
    printCenter(0.5 * Settings.SCREEN_WIDTH, 0.25 * Settings.SCREEN_HEIGHT, 6, 'SUPER CASTLE GAME', 1.5, tOscillator)
    // con.lineWidth = 3
    // con.strokeStyle = Palette.NOTHING
    // con.stroke()
    con.shadowColor = Palette.NOTHING
    con.shadowOffsetX = con.shadowOffsetY = 3
    con.fillStyle = Palette.INTRO
    con.fill()

    con.restore()
}
