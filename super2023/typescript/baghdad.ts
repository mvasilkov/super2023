/** This file is part of Super Holy Chalice.
 * https://github.com/mvasilkov/super2023
 * @license GPLv3 | Copyright (c) 2023 Mark Vasilkov
 */
'use strict'

import { easeInOutQuad } from '../node_modules/natlib/interpolation.js'
import { Palette, Settings, airfoil, oCon, qubba } from './setup.js'

const N = 200

export function paintBaghdad() {
    oCon.fillStyle = '#000'
    oCon.fillRect(0, 0, Settings.SCREEN_WIDTH, Settings.SCREEN_HEIGHT)

    for (let n = 0; n < N; ++n) {
        const t0 = n / N
        const t1 = (n + 1) / N

        const a0 = qubba(easeInOutQuad(t0)) * 0.01 * Math.PI
        const a1 = qubba(easeInOutQuad(t1)) * 0.01 * Math.PI

        oCon.beginPath()
        airfoil(0.5 * Settings.SCREEN_WIDTH, 0.5 * Settings.SCREEN_HEIGHT, 32, 20, 0.6, a0)
        airfoil(0.5 * Settings.SCREEN_WIDTH, 0.5 * Settings.SCREEN_HEIGHT, 32, 20, 0.6, a1)
        oCon.strokeStyle = Palette.DUCK
        oCon.stroke()

        oCon.beginPath()
        airfoil(0.5 * Settings.SCREEN_WIDTH - 150, 0.5 * Settings.SCREEN_HEIGHT + 40, 24, 15, 0.6, a0)
        airfoil(0.5 * Settings.SCREEN_WIDTH - 150, 0.5 * Settings.SCREEN_HEIGHT + 40, 24, 15, 0.6, a1)
        oCon.strokeStyle = Palette.DUCK
        oCon.stroke()

        oCon.beginPath()
        airfoil(0.5 * Settings.SCREEN_WIDTH + 150, 0.5 * Settings.SCREEN_HEIGHT + 40, 24, 15, 0.6, a0)
        airfoil(0.5 * Settings.SCREEN_WIDTH + 150, 0.5 * Settings.SCREEN_HEIGHT + 40, 24, 15, 0.6, a1)
        oCon.strokeStyle = Palette.DUCK
        oCon.stroke()
    }
}
