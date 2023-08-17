/** This file is part of Super Holy Chalice.
 * https://github.com/mvasilkov/super2023
 * @license GPLv3 | Copyright (c) 2023 Mark Vasilkov
 */
'use strict'

import { easeInOutQuad, lerp } from '../node_modules/natlib/interpolation.js'
import { ShortBool, type ExtendedBool } from '../node_modules/natlib/prelude.js'
import { enterPhase, interpolatePhase } from '../node_modules/natlib/state.js'
import { Board } from './Board.js'
import { Cluster, PieceType, type Piece } from './Piece.js'
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
            if (this.board.positions[piece.y]![piece.x]!.some(p => p.type === PieceType.CUTTER)) {
                piece.killed = ShortBool.TRUE
            }
            this.active.add(piece)
        }
        enterPhase(duckState, DuckPhase.MOVING, Settings.MOVE_DURATION)
        // .DeadCode
        return
        // .EndDeadCode
    }

    updateDucksOnGoal() {
        this.board.pieces[PieceType.DUCK]?.forEach(duck => {
            const onGoal = this.board.positions[duck.y]![duck.x]!.some(p => p.type === PieceType.GOAL)

            if (onGoal) duckState.ducksOnGoal.add(duck)
            else duckState.ducksOnGoal.delete(duck)
        })
    }

    connectDucklings(ducks: Piece[]) {
        const clusters: Set<Cluster> = new Set

        ducks.forEach(duck => {
            this.board.getBorderingPieces(duck, PieceType.DUCKLING)?.forEach(duckling => {
                clusters.add(duckling.cluster!)
            })
        })

        if (!clusters.size) return

        clusters.forEach(cluster => {
            cluster.pieces.forEach(duckling => {
                this.board.discardPiece(duckling)
                const duck = this.board.createPiece(PieceType.DUCK, duckling.x, duckling.y)
                this.active.add(duck)
            })
        })

        new Cluster(this.board.pieces[PieceType.DUCK]!)

        enterPhase(duckState, DuckPhase.CONNECTING, Settings.CONNECT_DURATION)
    }

    render(t: number) {
        const tDuck = duckState.phase === DuckPhase.MOVING ?
            easeInOutQuad(interpolatePhase(duckState, Settings.MOVE_DURATION, t)) :
            duckState.phase === DuckPhase.CONNECTING ?
                easeInOutQuad(interpolatePhase(duckState, Settings.CONNECT_DURATION, t)) : 0

        for (let y = 0; y < this.board.height; ++y) {
            for (let x = 0; x < this.board.width; ++x) {
                const pieces = this.board.positions[y]![x]! // .Inline(1)

                pieces.forEach(piece => this.renderPiece(piece, x, y, tDuck))
            }
        }
    }

    renderPiece(piece: Piece, x: number, y: number, tDuck: number) {
        if (duckState.phase === DuckPhase.MOVING && this.active.has(piece)) {
            x += lerp(piece.oldPosition.x - piece.x, 0, tDuck)
            y += lerp(piece.oldPosition.y - piece.y, 0, tDuck)
        }

        let size = this.cellSize
        x = x * size + this.boardLeft
        y = y * size + this.boardTop

        if (piece.killed) {
            size = lerp(size, 0, tDuck)
            const padding = 0.5 * (this.cellSize - size)
            x += padding
            y += padding
        }

        switch (piece.type) {
            case PieceType.DUCK:
                con.fillStyle = duckState.ducksOnGoal.has(piece) ? '#a7f070' : '#ffcd75'
                con.fillRect(x, y, size, size)

                if (duckState.phase === DuckPhase.CONNECTING && this.active.has(piece)) {
                    const progress = size * tDuck

                    con.fillStyle = '#94b0c2'
                    con.fillRect(x + progress, y, size - progress, size)
                }
                break
            case PieceType.DUCKLING:
                con.fillStyle = '#94b0c2'
                con.fillRect(x, y, size, size)
                break
            case PieceType.BOX:
                con.fillStyle = '#566c86'
                con.fillRect(x, y, size, size)
                break
            case PieceType.CUTTER:
                con.fillStyle = '#b13e53'
                con.fillRect(x, y, size, size)
                break
            case PieceType.GOAL:
                const step = size / Settings.HATCHING_AMOUNT

                con.beginPath()
                for (let n = 0; n < Settings.HATCHING_AMOUNT; ++n) {
                    const sn = step * (n + 0.5)

                    con.moveTo(x, y + sn)
                    con.lineTo(x + sn, y)
                    con.moveTo(x + size, y + size - sn)
                    con.lineTo(x + size - sn, y + size)
                }
                con.strokeStyle = '#a7f070'
                con.stroke()
        }
    }
}
