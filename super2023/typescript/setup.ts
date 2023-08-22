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
    OSCILLATOR_DURATION = 48,
    // Oscillator
    OSCILLATOR_INCREMENT = 0.1,
    // Pointer controls dead zone in tiles
    POINTER_DEAD_ZONE = 0.5,
    // Controller dead zone
    GAMEPAD_DEAD_ZONE = 0.25,
    // Blocks
    BLOCK_HEIGHT = 0.4,
    // Linear hatching
    HATCHING_AMOUNT = 3,
}

// Palette: https://lospec.com/palette-list/sweetie-16

export const enum Palette {
    NOTHING = '#000',
    BOARD = '#1a1c2c',
    GRID = '#333c57',
    CUTTER = '#ea323c',
    GOAL = '#a7f070',
    VOID = '#566c86',
    // Blocks
    DUCK = '#ffcd75',
    DUCK_2 = '#ef7d57',
    DUCK_ON_GOAL = '#a7f070',
    DUCK_ON_GOAL_2 = '#38b764',
    DUCKLING = '#94b0c2',
    DUCKLING_2 = '#566c86',
    BOX = '#566c86',
    BOX_2 = '#333c57',
}

// Output

export const canvas = new CanvasHandle(document.querySelector('#c'),
    Settings.SCREEN_WIDTH, Settings.SCREEN_HEIGHT)

export const { con } = canvas

con.lineWidth = 1.5

/** Overlay canvas */
export const oCanvas = new CanvasHandle(document.querySelector('#o'),
    Settings.SCREEN_WIDTH, Settings.SCREEN_HEIGHT)

/** Overlay context */
export const oCon = oCanvas.con

oCon.lineWidth = 2
oCon.lineCap = 'round'

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
    n /= 255
    return n <= 0.0404482362771082 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4)
}

export function linearToSrgb(n: number): string {
    return Math.floor(255 * (n <= 0.00313066844250063 ? n * 12.92 : 1.055 * Math.pow(n, 1 / 2.4) - 0.055)).toString(16)
}

// Colors for transitions

// Palette.DUCK = '#ffcd75'
export const COLOR_DUCK_R = srgbToLinear(0xff)
export const COLOR_DUCK_G = srgbToLinear(0xcd)
export const COLOR_DUCK_B = srgbToLinear(0x75)

// Palette.DUCK_2 = '#ef7d57'
export const COLOR_DUCK_2_R = srgbToLinear(0xef)
export const COLOR_DUCK_2_G = srgbToLinear(0x7d)
export const COLOR_DUCK_2_B = srgbToLinear(0x57)

// Palette.DUCK_ON_GOAL = '#a7f070'
export const COLOR_GOAL_R = srgbToLinear(0xa7)
export const COLOR_GOAL_G = srgbToLinear(0xf0)
export const COLOR_GOAL_B = srgbToLinear(0x70)

// Palette.DUCK_ON_GOAL_2 = '#38b764'
export const COLOR_GOAL_2_R = srgbToLinear(0x38)
export const COLOR_GOAL_2_G = srgbToLinear(0xb7)
export const COLOR_GOAL_2_B = srgbToLinear(0x64)

// More functions

/** Joukowsky airfoil */
export function airfoil(x0: number, y0: number, xs: number, ys: number, q: number, t: number) {
    const qcos = q * Math.cos(t)
    const qsin = q * Math.sin(t)
    const a = 1 - q + qcos
    const b = a ** 2 + qsin ** 2
    const x = qsin - qsin / b
    const y = qcos + a / b

    oCon.lineTo(x0 - xs * x, y0 - ys * y)
}

/** Map [0...1] to [104...200] | [0...96] */
export function qubba(t: number) {
    if (t < 0.5) {
        // Map to the range [104, 200]
        return 104 + t * (200 - 104) * 2
    }
    else {
        // Map to the range [0, 96]
        return 0 + (t - 0.5) * (96 - 0) * 2
    }
}
