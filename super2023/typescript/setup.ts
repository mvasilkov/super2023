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
    MOVE_DURATION = 10,
    CONNECT_DURATION = 20,
    OSCILLATOR_DURATION = 24,
    // Oscillator
    OSCILLATOR_INCREMENT = 0.1,
    // Pointer controls dead zone in tiles
    POINTER_DEAD_ZONE = 0.5,
    // Blocks
    BLOCK_HEIGHT = 0.4,
    // Linear hatching
    HATCHING_AMOUNT = 3,
}

// Output

export const canvas = new CanvasHandle(document.querySelector('#c'),
    Settings.SCREEN_WIDTH, Settings.SCREEN_HEIGHT)

export const { con } = canvas

con.lineWidth = 1.5

// Input

export const keyboard = new Keyboard
keyboard.addEventListeners(document)

export const pointer = new Pointer(canvas.canvas)
pointer.addEventListeners(document)

// Helper functions

export function oscillate(t: number): number {
    return t < 0.5 ? 2 * t : 2 - 2 * t
}

export function wrapAround(t: number): number {
    return t - Math.floor(t)
}

export function srgbToLinear(n: number): number {
    return n <= 0.0404482362771082 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4)
}

export function linearToSrgb(n: number): number {
    return n <= 0.00313066844250063 ? n * 12.92 : 1.055 * Math.pow(n, 1 / 2.4) - 0.055
}
