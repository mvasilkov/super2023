/** This file is part of Super Holy Chalice.
 * https://github.com/mvasilkov/super2023
 * @license GPLv3 | Copyright (c) 2023 Mark Vasilkov
 */
'use strict'

import type { IState } from '../node_modules/natlib/state'

export const enum DuckPhase {
    INITIAL,
    INTERACTIVE,
    MOVING,
    CONNECTING,
}

export const duckPhaseMap = [
    DuckPhase.INTERACTIVE, ,
    , ,
    DuckPhase.INTERACTIVE, ,
    DuckPhase.INTERACTIVE, ,
]

export interface IDuckState extends IState {
}

export const duckState: IDuckState = {
    phase: DuckPhase.INITIAL,
    phaseTtl: 0,
    oldTtl: 0,
}
