/** This file is part of Super Castle Game.
 * https://github.com/mvasilkov/super2023
 * @license GPLv3 | Copyright (c) 2023 Mark Vasilkov
 */
'use strict'

import { CanvasHandle } from '../node_modules/natlib/canvas/CanvasHandle.js'
import { Pointer } from '../node_modules/natlib/controls/Pointer.js'
import { AutoScaleWrapper } from '../node_modules/natlib/viewport/AutoScaleWrapper.js'
import { Keyboard } from './Keyboard.js'

export const enum Settings {
    // Screen size
    SCREEN_WIDTH = 960,
    SCREEN_HEIGHT = 540, // 16:9
    // Durations (in ticks, 1 second = 50 ticks)
    MOVE_DURATION = 10,
    CONNECT_DURATION = 20,
    OSCILLATOR_DURATION = 48,
    LEAVE_DURATION = 64,
    ENTER_DURATION = 64,
    TITLE_ENTER_DURATION = 96,
    // Oscillator
    OSCILLATOR_INCREMENT = 0.1,
    // Pointer controls dead zone in tiles
    POINTER_DEAD_ZONE = 0.5,
    // Controller dead zone
    GAMEPAD_DEAD_ZONE = 0.25,
    // Blocks
    BLOCK_HEIGHT = 0.4,
    BLOCK_REFLECTION_OPACITY = 20,
    BLOCK_GROW = 0.25,
    // Linear hatching
    HATCHING_AMOUNT = 3,
    // Level loading
    LEVEL_CARDINALITY = 7,
    // Castle properties
    CASTLE_BLK_SIZE = 30,
    CASTLE_BLK_SCALE = 0.47,
    CASTLE_WIDTH = 7, // Size(X)
    CASTLE_LENGTH = 7, // Size(Y)
    CASTLE_HEIGHT = 7, // Size(Z)
    // Icons
    ICON_SIZE = 48,
    ICON_SPACING = 8,
    // Level select
    LEVEL_SELECT_FONT_SIZE = 6,
    COMMUNITY_LEVELS_URL = 'https://github.com/mvasilkov/super2023/tree/master/levels',
}

// Palette: https://lospec.com/palette-list/sweetie-16

export const enum Palette {
    NOTHING = '#000',
    BOARD = '#1a1c2c',
    GRID = '#333c57',
    GOAL = '#a7f070',
    VOID = '#566c86',
    OUTLINE = '#41a6f6',
    INTRO = '#ffcd75',
    INTRO_2 = '#ef7d57',
    // Blocks
    DUCK = '#ffcd75',
    DUCK_2 = '#ef7d57',
    DUCK_ON_GOAL = '#a7f070',
    DUCK_ON_GOAL_2 = '#38b764',
    DUCKLING = '#94b0c2',
    DUCKLING_2 = '#566c86',
    BOX = '#41a6f6',
    BOX_2 = '#3b5dc9',
    CUTTER = '#f5555d',
    CUTTER_2 = '#c42430',
    // IsoBlocks
    CASTLE = '#94b0c2',
    CASTLE_2 = '#566c86',
    CASTLE_3 = '#333c57',
    // Buttons
    BUTTON = '#ffcd75',
    BUTTON_2 = '#f5555d',
    BUTTON_3 = '#c42430',
    // Icons
    ICON = '#ffcd75',
    ICON_INACTIVE = '#ffcd7580',
    // Level select
    LEVEL_CLEAR = '#a7f070',
    LEVEL_INCOMPLETE = '#f4f4f4',
    LEVELS_LINK = '#73eff7',
}

// Output

export const canvas = new CanvasHandle(document.querySelector('#c'),
    Settings.SCREEN_WIDTH, Settings.SCREEN_HEIGHT)

export const con = canvas.con
con.lineWidth = 1.5

export const autoscale = new AutoScaleWrapper(document.querySelector('#a')!,
    Settings.SCREEN_WIDTH, Settings.SCREEN_HEIGHT)

autoscale.addEventListeners()

// Input

export const keyboard = new Keyboard
keyboard.addEventListeners(document)

class XPointer extends Pointer {
    override setPosition(event: MouseEvent | Touch) {
        super.setPosition(event)
        autoscale.documentToViewport(this)
    }
}

export const pointer = new XPointer(canvas.canvas)
pointer.addEventListeners(document)

// Disable the context menu
document.addEventListener('contextmenu', event => {
    event.preventDefault()
})

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
