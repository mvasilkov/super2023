/** This file is part of Super Holy Chalice.
 * https://github.com/mvasilkov/super2023
 * @license GPLv3 | Copyright (c) 2023 Mark Vasilkov
 */
'use strict'

import { easeInOutQuad, lerp } from '../node_modules/natlib/interpolation.js'
import { ShortBool, type ExtendedBool } from '../node_modules/natlib/prelude.js'
import { enterPhase, interpolatePhase } from '../node_modules/natlib/state.js'
import { Board } from './Board.js'
import { PieceType, type Piece } from './Piece.js'
import { cascadeMove } from './rules.js'
import { Settings, con } from './setup.js'
import { DuckPhase, duckState } from './state.js'

export class Level {
    readonly board: Board
    readonly active: Set<Piece>
    // Rendering properties
    readonly cellSize: number
    readonly boardLeft: number
    readonly boardTop: number

    constructor(width: number, height: number) {
        this.board = new Board(width, height)
        this.active = new Set

        this.cellSize = Math.min(Settings.SCREEN_WIDTH / width, Settings.SCREEN_HEIGHT / height)
        this.boardLeft = 0.5 * (Settings.SCREEN_WIDTH - width * this.cellSize)
        this.boardTop = 0.5 * (Settings.SCREEN_HEIGHT - height * this.cellSize)
    }

    tryMove(piece: Piece, Δx: -1 | 1, Δy: 0): ExtendedBool
    tryMove(piece: Piece, Δx: 0, Δy: -1 | 1): ExtendedBool

    /** Move a piece. Return TRUE on failure. */
    tryMove(piece: Piece, Δx: number, Δy: number): ExtendedBool {
        const plan = cascadeMove(this.board, piece, Δx, Δy)
        if (!plan) return ShortBool.TRUE
        for ([piece, Δx, Δy] of plan) {
            this.board.putPiece(piece, piece.x + Δx, piece.y + Δy)
            this.active.add(piece)
        }
        enterPhase(duckState, DuckPhase.MOVING, Settings.MOVE_DURATION)
        // .DeadCode
        return
        // .EndDeadCode
    }

    connectDucklings(ducks: Piece[]) {
    }

    render(t: number) {
        const tDuck = duckState.phase === DuckPhase.MOVING ?
            easeInOutQuad(interpolatePhase(duckState, Settings.MOVE_DURATION, t)) : 0

        for (let y = 0; y < this.board.height; ++y) {
            for (let x = 0; x < this.board.width; ++x) {
                const pieces = this.board.positions[y]![x]! // .Inline(1)

                pieces.forEach(piece => this.renderPiece(piece, x, y, tDuck))
            }
        }
    }

    renderPiece(piece: Piece, x: number, y: number, tDuck: number) {
        if (this.active.has(piece)) {
            x += lerp(piece.oldPosition.x - piece.x, 0, tDuck)
            y += lerp(piece.oldPosition.y - piece.y, 0, tDuck)
        }

        const u = x * this.cellSize + this.boardLeft
        const v = y * this.cellSize + this.boardTop

        switch (piece.type) {
            case PieceType.DUCK:
                con.fillStyle = '#ffcd75'
                con.fillRect(u, v, this.cellSize, this.cellSize)
                break
            case PieceType.DUCKLING:
                con.fillStyle = '#94b0c2'
                con.fillRect(u, v, this.cellSize, this.cellSize)
        }
    }
}
