/** This file is part of Super Holy Chalice.
 * https://github.com/mvasilkov/super2023
 * @license GPLv3 | Copyright (c) 2023 Mark Vasilkov
 */
'use strict'

import { Input } from '../node_modules/natlib/controls/Keyboard.js'
import { startMainloop } from '../node_modules/natlib/scheduling/mainloop.js'
import { updatePhase } from '../node_modules/natlib/state.js'
import { Level } from './Level.js'
import { Cluster, PieceType } from './Piece.js'
import { Settings, con, keyboard } from './setup.js'
import { DuckPhase, duckPhaseMap, duckState } from './state.js'

//#region Move to another file
const level = new Level(16, 16)

new Cluster([
    level.board.createPiece(PieceType.DUCK, 8, 7),
    level.board.createPiece(PieceType.DUCK, 7, 8),
    level.board.createPiece(PieceType.DUCK, 8, 8),
    level.board.createPiece(PieceType.DUCK, 9, 8),
    level.board.createPiece(PieceType.DUCK, 8, 9),
])

new Cluster([
    level.board.createPiece(PieceType.DUCKLING, 5, 11),
    level.board.createPiece(PieceType.DUCKLING, 4, 12),
    level.board.createPiece(PieceType.DUCKLING, 5, 12),
    level.board.createPiece(PieceType.DUCKLING, 6, 12),
])
//#endregion

type MoveScalar = -1 | 0 | 1

function updateControls() {
    const left = keyboard.state[Input.LEFT] || keyboard.state[Input.LEFT_A]
    const up = keyboard.state[Input.UP] || keyboard.state[Input.UP_W]
    const right = keyboard.state[Input.RIGHT] || keyboard.state[Input.RIGHT_D]
    const down = keyboard.state[Input.DOWN] || keyboard.state[Input.DOWN_S]

    // Left XOR right || up XOR down
    if ((left ? !right : right) || (up ? !down : down)) {
        let ducks = level.board.pieces[PieceType.DUCK] ?? []
        if (!ducks.length) return

        const Δx = (right ? 1 : 0) - (left ? 1 : 0) as MoveScalar
        const Δy = (down ? 1 : 0) - (up ? 1 : 0) as MoveScalar

        if (Δx) {
            ducks.sort((a, b) => Δx * (b.x - a.x))
            if (!level.tryMove(ducks[0]!, Δx, 0)) return
        }

        if (Δy) {
            ducks.sort((a, b) => Δy * (b.y - a.y))
            if (!level.tryMove(ducks[0]!, 0, Δy)) return
        }
    }
}

function update() {
    const oldPhase = updatePhase(duckState, duckPhaseMap)

    switch (duckState.phase) {
        case DuckPhase.INTERACTIVE:
            if (oldPhase === DuckPhase.MOVING) {
                for (const piece of level.active) {
                    piece.oldPosition.copy(piece)
                }
                level.active.clear()
            }
            updateControls()
    }
}

function render(t: number) {
    con.fillStyle = '#1a1c2c'
    con.fillRect(0, 0, Settings.SCREEN_WIDTH, Settings.SCREEN_HEIGHT)

    level.render(t)
}

startMainloop(update, render)
