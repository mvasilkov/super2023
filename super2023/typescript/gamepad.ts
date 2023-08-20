/** This file is part of Super Holy Chalice.
 * https://github.com/mvasilkov/super2023
 * @license GPLv3 | Copyright (c) 2023 Mark Vasilkov
 */
'use strict'

import { register0 } from '../node_modules/natlib/runtime.js'
import type { Vec2 } from '../node_modules/natlib/Vec2'
import { Settings } from './setup.js'

export function getGamepadDirection(): Vec2 | undefined {
    try {
        for (const gamepad of navigator.getGamepads()) {
            if (gamepad) {
                return register0.set(
                    gamepad.axes[0]! < -Settings.GAMEPAD_DEAD_ZONE ? -1 :
                        gamepad.axes[0]! > Settings.GAMEPAD_DEAD_ZONE ? 1 : 0,
                    gamepad.axes[1]! < -Settings.GAMEPAD_DEAD_ZONE ? -1 :
                        gamepad.axes[1]! > Settings.GAMEPAD_DEAD_ZONE ? 1 : 0
                )
            }
        }
    }
    catch (err) {
    }
    // .DeadCode
    return
    // .EndDeadCode
}
