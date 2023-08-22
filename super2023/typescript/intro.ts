/** This file is part of Super Holy Chalice.
 * https://github.com/mvasilkov/super2023
 * @license GPLv3 | Copyright (c) 2023 Mark Vasilkov
 */
'use strict'

import { easeInOutQuad } from '../node_modules/natlib/interpolation.js'
import { interpolatePhase } from '../node_modules/natlib/state.js'
import { Palette, Settings, oCon } from './setup.js'
import { duckState } from './state.js'

export function renderIntro(t: number) {
    let t1 = interpolatePhase(duckState, Settings.LEAVE_DURATION, t)
    let t0 = Math.max(0, t1 - Settings.BAGHDAD_OVERLAP)
    let t2 = Math.min(1, t1 + Settings.BAGHDAD_OVERLAP)

    t0 = angular(easeInOutQuad(t0))
    t1 = angular(easeInOutQuad(t1))
    t2 = angular(easeInOutQuad(t2))

    oCon.strokeStyle = Palette.DUCK

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
    const x = qsin - qsin / b
    const y = qcos + a / b

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
