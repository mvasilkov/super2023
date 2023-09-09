/** This file is part of natlib.
 * https://github.com/mvasilkov/natlib
 * @license MIT | Copyright (c) 2022, 2023 Mark Vasilkov
 */
'use strict'

import { lerp } from '../node_modules/natlib/interpolation.js'

/** Phase and TTL fields */
export interface IState {
    phase: number
    phaseTtl: number
    oldTtl: number
}

/** Map the current phase to the next phase and its TTL.
 * The next phase is stored at index `2 * currentPhase`,
 * and the TTL at index `2 * currentPhase + 1`. */
export type NextPhaseMap = { [n: number]: number | undefined }

/** Set the current phase and TTL. */
export function enterPhase(state: IState, phase: number, ttl = 0) {
    state.phase = phase
    state.phaseTtl = (state.oldTtl = ttl) - 1
}

/** Update the current phase and TTL.
 * If the phase has changed, return the previous phase. */
export function updatePhase(state: IState, nextPhaseMap: Readonly<NextPhaseMap>): number | undefined {
    state.oldTtl = state.phaseTtl
    if (state.phaseTtl > 0) {
        --state.phaseTtl
        return
    }
    const n = state.phase << 1
    const nextPhase = nextPhaseMap[n]
    if (!nextPhase) return

    const oldPhase = state.phase
    enterPhase(state, nextPhase, nextPhaseMap[n | 1])
    return oldPhase
}

/** Interpolate the current phase progress. */
export function interpolatePhase(state: Readonly<IState>, ttl: number, t: number): number {
    return 1 - lerp(state.oldTtl, state.phaseTtl, t) / ttl
}
