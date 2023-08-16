/** This file is part of Super Holy Chalice.
 * https://github.com/mvasilkov/super2023
 * @license GPLv3 | Copyright (c) 2023 Mark Vasilkov
 */
'use strict'

import { CanvasHandle } from '../node_modules/natlib/canvas/CanvasHandle.js'
import { Keyboard } from '../node_modules/natlib/controls/Keyboard.js'
import { Pointer } from '../node_modules/natlib/controls/Pointer.js'

export const enum Settings {
    // Screen size
    SCREEN_WIDTH = 960,
    SCREEN_HEIGHT = 540, // 16:9
    // Durations (in ticks, 1 second = 50 ticks)
    MOVE_DURATION = 20,
    CONNECT_DURATION = 20,
    // Pointer controls dead zone in tiles
    POINTER_DEAD_ZONE = 0.5,
}

// Output

export const canvas = new CanvasHandle(document.querySelector('#c'),
    Settings.SCREEN_WIDTH, Settings.SCREEN_HEIGHT)

export const { con } = canvas

// Input

export const keyboard = new Keyboard
keyboard.addEventListeners(document)

export const pointer = new Pointer(canvas.canvas)
pointer.addEventListeners(document)
