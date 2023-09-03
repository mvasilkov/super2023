/** This file is part of Super Castle Game.
 * https://github.com/mvasilkov/super2023
 * @license GPLv3 | Copyright (c) 2023 Mark Vasilkov
 */
'use strict'

import type { IState } from '../node_modules/natlib/state'
import type { Piece } from './Piece'
import { Settings } from './setup.js'

// Duck

export const enum DuckPhase {
    INITIAL,
    TITLE_SCREEN,
    INTERACTIVE,
    MOVING,
    CONNECTING,
    LEAVING,
    ENTERING,
}

export const duckPhaseMap = [
    DuckPhase.TITLE_SCREEN, Settings.TITLE_ENTER_DURATION,
    , ,
    , ,
    DuckPhase.INTERACTIVE, ,
    DuckPhase.INTERACTIVE, ,
    DuckPhase.ENTERING, Settings.ENTER_DURATION,
    DuckPhase.INTERACTIVE, ,
]

export interface IDuckState extends IState {
    ducksOnGoal: Set<Piece>
    ducksOnGoalNext: Set<Piece>
}

export const duckState: IDuckState = {
    // IState
    phase: DuckPhase.INITIAL,
    phaseTtl: 0,
    oldTtl: 0,
    // IDuckState
    ducksOnGoal: new Set,
    ducksOnGoalNext: new Set,
}

// Oscillator

export const enum OscillatorPhase {
    INITIAL,
    CYCLE,
}

export const oscillatorPhaseMap = [
    OscillatorPhase.CYCLE, Settings.OSCILLATOR_DURATION,
    OscillatorPhase.CYCLE, Settings.OSCILLATOR_DURATION,
]

export interface IOscillatorState extends IState {
}

export const oscillatorState: IOscillatorState = {
    phase: OscillatorPhase.INITIAL,
    phaseTtl: 0,
    oldTtl: 0,
}
