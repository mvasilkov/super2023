/** This file is part of Super Holy Chalice.
 * https://github.com/mvasilkov/super2023
 * @license GPLv3 | Copyright (c) 2023 Mark Vasilkov
 */
'use strict'

import { CanvasHandle } from '../node_modules/natlib/canvas/CanvasHandle.js'

export const enum Settings {
    // Screen size
    SCREEN_WIDTH = 960,
    SCREEN_HEIGHT = 540, // 16:9
}

// Output

export const canvas = new CanvasHandle(document.querySelector('#c'),
    Settings.SCREEN_WIDTH, Settings.SCREEN_HEIGHT)

export const { con } = canvas
