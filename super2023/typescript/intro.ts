/** This file is part of Super Siege of Baghdad.
 * https://github.com/mvasilkov/super2023
 * @license GPLv3 | Copyright (c) 2023 Mark Vasilkov
 */
'use strict'

import { easeInOutQuad, easeOutQuad, lerp } from '../node_modules/natlib/interpolation.js'
import { interpolatePhase } from '../node_modules/natlib/state.js'
import { printCenter } from './print.js'
import { Palette, Settings, con, oCon } from './setup.js'
import { duckState } from './state.js'

export function renderIntro(t: number, tOscillator: number) {
    let t1 = interpolatePhase(duckState, Settings.LEAVE_DURATION, t)
    let t0 = Math.max(0, t1 - Settings.INTRO_OVERLAP)
    let t2 = Math.min(1, t1 + Settings.INTRO_OVERLAP)

    t = easeInOutQuad(t1)

    con.fillStyle = Palette.INTRO_2
    con.fillRect(0, 0.5 * (1 - t) * Settings.SCREEN_HEIGHT,
        Settings.SCREEN_WIDTH, t * Settings.SCREEN_HEIGHT)

    oCon.clearRect(0, 0, Settings.SCREEN_WIDTH, 0.35 * Settings.SCREEN_HEIGHT)
    oCon.beginPath()
    printCenter(0.5 * Settings.SCREEN_WIDTH, lerp(-20, 0.25 * Settings.SCREEN_HEIGHT, easeOutQuad(t1)), 5, 'SUPER SIEGE of BAGHDAD', 1, tOscillator)
    oCon.fillStyle = Palette.INTRO
    oCon.fill()

    t0 = angular(easeInOutQuad(t0))
    t1 = angular(easeInOutQuad(t1))
    t2 = angular(easeInOutQuad(t2))

    oCon.strokeStyle = Palette.INTRO

    oCon.beginPath()
    airfoil(0.5 * Settings.SCREEN_WIDTH, 0.5 * Settings.SCREEN_HEIGHT, 32, 20, 0.6, t0)
    airfoil(0.5 * Settings.SCREEN_WIDTH, 0.5 * Settings.SCREEN_HEIGHT, 32, 20, 0.6, t1)
    airfoil(0.5 * Settings.SCREEN_WIDTH, 0.5 * Settings.SCREEN_HEIGHT, 32, 20, 0.6, t2)
    oCon.stroke()

    oCon.beginPath()
    airfoil(0.5 * Settings.SCREEN_WIDTH - 150, 0.5 * Settings.SCREEN_HEIGHT + 40, 24, 15, 0.6, t0)
    airfoil(0.5 * Settings.SCREEN_WIDTH - 150, 0.5 * Settings.SCREEN_HEIGHT + 40, 24, 15, 0.6, t1)
    airfoil(0.5 * Settings.SCREEN_WIDTH - 150, 0.5 * Settings.SCREEN_HEIGHT + 40, 24, 15, 0.6, t2)
    oCon.stroke()

    oCon.beginPath()
    airfoil(0.5 * Settings.SCREEN_WIDTH + 150, 0.5 * Settings.SCREEN_HEIGHT + 40, 24, 15, 0.6, t0)
    airfoil(0.5 * Settings.SCREEN_WIDTH + 150, 0.5 * Settings.SCREEN_HEIGHT + 40, 24, 15, 0.6, t1)
    airfoil(0.5 * Settings.SCREEN_WIDTH + 150, 0.5 * Settings.SCREEN_HEIGHT + 40, 24, 15, 0.6, t2)
    oCon.stroke()
}

/** Joukowsky airfoil */
function airfoil(x0: number, y0: number, xs: number, ys: number, q: number, t: number) {
    const qcos = q * Math.cos(t)
    const qsin = q * Math.sin(t)
    const a = 1 - q + qcos
    const b = a ** 2 + qsin ** 2
    const x = qsin - qsin / b // .Inline(1)
    const y = qcos + a / b // .Inline(1)

    oCon.lineTo(x0 - xs * x, y0 - ys * y)
}

/** Map [0...1] to [104...200] | [0...96] and then to an angle. */
function angular(t: number): number {
    return 0.01 * Math.PI * (t < 0.5 ?
        // Map to the range [104, 200]
        104 + t * (200 - 104) * 2 :
        // Map to the range [0, 96]
        0 + (t - 0.5) * (96 - 0) * 2)
}

export function renderIntroEnd(t: number, tOscillator: number) {
    t = easeInOutQuad(interpolatePhase(duckState, Settings.ENTER_DURATION, t))

    con.fillStyle = Palette.INTRO_2
    con.fillRect(0.5 * t * Settings.SCREEN_WIDTH, 0,
        (1 - t) * Settings.SCREEN_WIDTH, Settings.SCREEN_HEIGHT)

    oCon.clearRect(0, 0, Settings.SCREEN_WIDTH, 0.35 * Settings.SCREEN_HEIGHT)
    oCon.beginPath()
    printCenter(0.5 * Settings.SCREEN_WIDTH, 0.25 * Settings.SCREEN_HEIGHT, 5, 'SUPER SIEGE of BAGHDAD', 1, tOscillator)
    oCon.fillStyle = Palette.INTRO
    oCon.fill()

    const eraseSize = 0.5 * t * Settings.SCREEN_WIDTH
    oCon.clearRect(0, 0, eraseSize, Settings.SCREEN_HEIGHT)
    oCon.clearRect(Settings.SCREEN_WIDTH - eraseSize, 0, eraseSize, Settings.SCREEN_HEIGHT)
}
