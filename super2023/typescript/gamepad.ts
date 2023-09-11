/** This file is part of Super Castle Game.
 * https://github.com/mvasilkov/super2023
 * @license GPLv3 | Copyright (c) 2023 Mark Vasilkov
 */
'use strict'

import { register0, type Vec2 } from './Vec2.js'
import { Settings } from './setup.js'

type Vec2B = Vec2 & { b?: boolean }

const result: Vec2B = register0

export function getGamepadDirection(): Vec2B | undefined {
    try {
        for (const gamepad of navigator.getGamepads()) {
            if (gamepad) {
                result.b = gamepad.buttons[1]!.pressed
                return result.set(
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
