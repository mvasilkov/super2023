/** This file is part of natlib.
 * https://github.com/mvasilkov/natlib
 * @license MIT | Copyright (c) 2022, 2023 Mark Vasilkov
 */
'use strict'

import { ShortBool, type ExtendedBool } from '../node_modules/natlib/prelude.js'

type Code = 'ArrowLeft' | 'ArrowUp' | 'ArrowRight' | 'ArrowDown' | 'KeyW' | 'KeyA' | 'KeyS' | 'KeyD' | 'KeyR' | 'Space'

type Hashed<T extends string> =
    T extends `${infer Chr0}${infer _Chr1}${infer _Chr2}${infer Chr3}${infer _Chr4}${infer Chr5}${infer _Rest}` ? `${Chr0}${Chr3}${Chr5}` :
    T extends `${infer Chr0}${infer _Chr1}${infer _Chr2}${infer Chr3}${infer _Rest}` ? `${Chr0}${Chr3}` : never

/** Supported keyboard inputs */
export const enum Input { LEFT = 1, UP, RIGHT, DOWN, LEFT_A, UP_W, RIGHT_D, DOWN_S, R, SPACE }

const indices: { [HashedCode in Hashed<Code>]: Input } & { [a: string]: Input | undefined } = {
    AoL: Input.LEFT,
    AoU: Input.UP,
    AoR: Input.RIGHT,
    AoD: Input.DOWN,
    KA: Input.LEFT_A,
    KW: Input.UP_W,
    KD: Input.RIGHT_D,
    KS: Input.DOWN_S,
    KR: Input.R,
    Sc: Input.SPACE,
}

function hash(code: Code): Hashed<Code>

function hash(code: string): string {
    return (code[0] ?? '') + (code[3] ?? '') + (code[5] ?? '')
}

/** Keyboard controls class */
export class Keyboard {
    readonly state: ExtendedBool[]

    constructor() {
        this.state = []
    }

    /** Update the keyboard state. */
    setState(event: KeyboardEvent, pressed?: ExtendedBool) {
        if (pressed && (event.altKey || event.ctrlKey || event.metaKey)) {
            // Don't respond to keyboard shortcuts.
            return
        }
        const input = indices[hash(<Code>event.code)]
        if (input) {
            // Repeating keys don't change the state,
            // but still prevent the default action.
            if (!event.repeat) this.state[input] = pressed
            event.preventDefault()
        }
    }

    /** Initialize the event handlers. */
    addEventListeners(target: GlobalEventHandlers) {
        target.addEventListener('keydown', event => this.setState(event, ShortBool.TRUE))
        target.addEventListener('keyup', event => this.setState(event))
    }
}
