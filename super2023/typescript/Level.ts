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
import { COLOR_DUCK_2_B, COLOR_DUCK_2_G, COLOR_DUCK_2_R, COLOR_DUCK_B, COLOR_DUCK_G, COLOR_DUCK_R, COLOR_GOAL_2_B, COLOR_GOAL_2_G, COLOR_GOAL_2_R, COLOR_GOAL_B, COLOR_GOAL_G, COLOR_GOAL_R, Palette, Settings, con, linearToSrgb, oscillate, wrapAround } from './setup.js'
import { DuckPhase, duckState, oscillatorState } from './state.js'

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

        if (!this.board.pieces[PieceType.DUCK]?.filter(d => !d.killed).length) {
            // Don't kill the last duck: undo the changes.
            for ([piece, Δx, Δy] of plan) {
                this.board.putPiece(piece, piece.x - Δx, piece.y - Δy)
                piece.killed = ShortBool.FALSE
                this.active.delete(piece)
            }
            return ShortBool.TRUE
        }

        this.updateDucksOnGoal(duckState.ducksOnGoalNext)
        enterPhase(duckState, DuckPhase.MOVING, Settings.MOVE_DURATION)
        // .DeadCode
        return
        // .EndDeadCode
    }

    updateDucksOnGoal(collection: Set<Piece>) {
        this.board.pieces[PieceType.DUCK]?.forEach(duck => {
            const onGoal = this.board.positions[duck.y]![duck.x]!.some(p => p.type === PieceType.GOAL)

            if (onGoal) collection.add(duck)
            else collection.delete(duck)
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

    splitCluster(cluster: Cluster) {
        const type = cluster.pieces[0]!.type
        const pieces = new Set(cluster.pieces.filter(p => !p.killed))
        const clusters: Cluster[] = []

        for (const piece of pieces) {
            const group = [...this.board.getGroup(piece)]
            if (!group.length) continue

            group.forEach(p => pieces.delete(p))
            clusters.push(new Cluster(group))
        }

        if (type === PieceType.DUCK && clusters.length > 1) {
            clusters.sort((a, b) => b.pieces.length - a.pieces.length)

            for (let n = 1; n < clusters.length; ++n) {
                const ducklings: Piece<PieceType.DUCKLING>[] = []
                clusters[n]!.pieces.forEach(duck => {
                    duck.killed = ShortBool.TRUE
                    this.board.discardPiece(duck)
                    const duckling = this.board.createPiece(PieceType.DUCKLING, duck.x, duck.y)
                    this.active.add(duckling)
                    ducklings.push(duckling)
                })
                new Cluster(ducklings)
            }

            enterPhase(duckState, DuckPhase.CONNECTING, Settings.CONNECT_DURATION)
        }
    }

    render(t: number) {
        const tDuck = duckState.phase === DuckPhase.MOVING ?
            easeInOutQuad(interpolatePhase(duckState, Settings.MOVE_DURATION, t)) :
            duckState.phase === DuckPhase.CONNECTING ?
                easeInOutQuad(interpolatePhase(duckState, Settings.CONNECT_DURATION, t)) : 0

        const tOscillator = interpolatePhase(oscillatorState, Settings.OSCILLATOR_DURATION, t)

        const colorDuckEntering = '#' +
            linearToSrgb(lerp(COLOR_GOAL_R, COLOR_DUCK_R, tDuck)) +
            linearToSrgb(lerp(COLOR_GOAL_G, COLOR_DUCK_G, tDuck)) +
            linearToSrgb(lerp(COLOR_GOAL_B, COLOR_DUCK_B, tDuck))
        const secondaryColorDuckEntering = '#' +
            linearToSrgb(lerp(COLOR_GOAL_2_R, COLOR_DUCK_2_R, tDuck)) +
            linearToSrgb(lerp(COLOR_GOAL_2_G, COLOR_DUCK_2_G, tDuck)) +
            linearToSrgb(lerp(COLOR_GOAL_2_B, COLOR_DUCK_2_B, tDuck))

        const colorDuckLeaving = '#' +
            linearToSrgb(lerp(COLOR_DUCK_R, COLOR_GOAL_R, tDuck)) +
            linearToSrgb(lerp(COLOR_DUCK_G, COLOR_GOAL_G, tDuck)) +
            linearToSrgb(lerp(COLOR_DUCK_B, COLOR_GOAL_B, tDuck))
        const secondaryColorDuckLeaving = '#' +
            linearToSrgb(lerp(COLOR_DUCK_2_R, COLOR_GOAL_2_R, tDuck)) +
            linearToSrgb(lerp(COLOR_DUCK_2_G, COLOR_GOAL_2_G, tDuck)) +
            linearToSrgb(lerp(COLOR_DUCK_2_B, COLOR_GOAL_2_B, tDuck))

        const duckColors = [Palette.DUCK, colorDuckEntering, colorDuckLeaving, Palette.DUCK_ON_GOAL]
        const duckSecondaryColors = [Palette.DUCK_2, secondaryColorDuckEntering, secondaryColorDuckLeaving, Palette.DUCK_ON_GOAL_2]

        con.fillStyle = Palette.BOARD
        con.fillRect(this.boardLeft, this.boardTop, this.board.width * this.cellSize, this.board.height * this.cellSize)

        // Paint the grid
        con.beginPath()
        const size = Math.max(this.board.width, this.board.height)
        for (let n = 1; n < size; ++n) {
            con.moveTo(this.boardLeft + n * this.cellSize, this.boardTop)
            con.lineTo(this.boardLeft + n * this.cellSize, this.boardTop + this.board.height * this.cellSize)

            con.moveTo(this.boardLeft, this.boardTop + n * this.cellSize)
            con.lineTo(this.boardLeft + this.board.width * this.cellSize, this.boardTop + n * this.cellSize)
        }
        con.strokeStyle = Palette.GRID
        con.stroke()

        for (let y = 0; y < this.board.height; ++y) {
            for (let x = 0; x < this.board.width; ++x) {
                const pieces = this.board.positions[y]![x]! // .Inline(1)
                const tVibe = wrapAround(tOscillator + Settings.OSCILLATOR_INCREMENT * (x - 0.85 * y))

                pieces.forEach(piece => this.renderPiece(piece, x, y, tDuck, tVibe, duckColors, duckSecondaryColors))
            }
        }
    }

    renderPiece(piece: Piece, x: number, y: number, tDuck: number, tVibe: number, duckColors: string[], duckSecondaryColors: string[]) {
        if (duckState.phase === DuckPhase.MOVING && this.active.has(piece)) {
            x += lerp(piece.oldPosition.x - piece.x, 0, tDuck)
            y += lerp(piece.oldPosition.y - piece.y, 0, tDuck)
            // if (piece.type === PieceType.DUCK) {
            //     y -= 0.2 * easeOutQuad(oscillate(tDuck))
            // }
        }
        // else if (piece.type === PieceType.VOID) {
        //     y -= 0.1 * easeInOutQuad(oscillate(tVibe))
        // }

        let size = this.cellSize
        x = x * size + this.boardLeft
        y = y * size + this.boardTop

        if (piece.killed) {
            size = lerp(size, 0, tDuck) // .InlineExp
            const padding = 0.5 * (this.cellSize - size)
            x += padding
            y += padding
        }

        const bh = Settings.BLOCK_HEIGHT * size

        switch (piece.type) {
            case PieceType.VOID:
                con.fillStyle = Palette.NOTHING
                con.fillRect(x, y, size, size)

                y += (0.1 * easeInOutQuad(oscillate(tVibe)) - 0.05) * size

                con.beginPath()
                con.moveTo(x + 0.2 * size, y + 0.2 * size)
                con.lineTo(x + 0.8 * size, y + 0.8 * size)
                con.moveTo(x + 0.2 * size, y + 0.8 * size)
                con.lineTo(x + 0.8 * size, y + 0.2 * size)
                con.strokeStyle = Palette.VOID
                con.stroke()
                break
            case PieceType.DUCK:
                const colorIndex = (duckState.ducksOnGoal.has(piece) ? 1 : 0) + (duckState.ducksOnGoalNext.has(piece) ? 2 : 0)

                paintBlock(x, y, size, bh, 0, duckColors[colorIndex]!, duckSecondaryColors[colorIndex]!, 20)

                if (colorIndex === 3) {
                    con.beginPath()
                    con.moveTo(x + 0.2 * size, y - bh + 0.5 * size)
                    con.lineTo(x + 0.4 * size, y - bh + 0.7 * size)
                    con.lineTo(x + 0.8 * size, y - bh + 0.3 * size)
                    con.strokeStyle = Palette.DUCK_ON_GOAL_2
                    con.stroke()
                }
                else if (colorIndex === 0 && duckState.ducksOnGoal.size && duckState.ducksOnGoalNext.size) {
                    con.beginPath()
                    con.moveTo(x + 0.2 * size, y - bh + 0.2 * size)
                    con.lineTo(x + 0.8 * size, y - bh + 0.8 * size)
                    con.moveTo(x + 0.2 * size, y - bh + 0.8 * size)
                    con.lineTo(x + 0.8 * size, y - bh + 0.2 * size)
                    con.strokeStyle = Palette.DUCK_2
                    con.stroke()
                }

                if (duckState.phase === DuckPhase.CONNECTING && this.active.has(piece)) {
                    const progress = size * tDuck // .Inline(1)

                    paintBlock(x, y, size, bh, progress, Palette.DUCKLING, Palette.DUCKLING_2)
                }
                break
            case PieceType.DUCKLING:
                paintBlock(x, y, size, bh, 0, Palette.DUCKLING, Palette.DUCKLING_2, 20)

                if (duckState.phase === DuckPhase.CONNECTING && this.active.has(piece)) {
                    const progress = size * tDuck // .Inline(1)

                    paintBlock(x, y, size, bh, progress, Palette.DUCK, Palette.DUCK_2)
                }
                break
            case PieceType.BOX:
                paintBlock(x, y, size, bh, 0, Palette.BOX, Palette.BOX_2, 30)

                con.beginPath()
                con.arc(x + 0.5 * size, y - bh + 0.5 * size, 0.3 * size, 0, 2 * Math.PI)
                con.strokeStyle = Palette.BOX_2
                con.stroke()
                break
            case PieceType.CUTTER:
                const x0 = x + 0.5 * size
                const y0 = y + 0.5 * size
                const r = 0.25 * size * (1 - tVibe)
                const r2 = r + 0.25 * size
                const r3 = r + 0.5 * size
                const opacity = Math.floor(lerp(0, 255, tVibe)) // .Inline(1)

                con.beginPath()
                con.arc(x0, y0, r, 0, 2 * Math.PI)
                con.moveTo(x0 + r2, y0)
                con.arc(x0, y0, r2, 0, 2 * Math.PI)
                con.strokeStyle = Palette.CUTTER
                con.stroke()

                con.beginPath()
                con.arc(x0, y0, r3, 0, 2 * Math.PI)
                con.strokeStyle = Palette.CUTTER + opacity.toString(16).padStart(2, '0')
                con.stroke()
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
                con.strokeStyle = Palette.GOAL
                con.stroke()
        }
    }
}

function paintBlock(
    x: number,
    y: number,
    size: number,
    height: number,
    progress: number,
    color: string,
    color2: string,
    reflectionOpacity?: number) {

    if (reflectionOpacity) {
        con.fillStyle = color2 + reflectionOpacity
        con.fillRect(x, y + size, size, height)
    }

    con.fillStyle = color2
    con.fillRect(x + progress, y - height + size, size - progress, height)

    con.fillStyle = color
    con.fillRect(x + progress, y - height, size - progress, size)
}

export function loadLevel(): Level {
    const string = location.hash.slice(1)
    const width = parseInt(string.slice(0, 2), 16)
    const height = parseInt(string.slice(2, 4), 16)
    const bigint = BigInt('0x' + string.slice(4))
    const level = new Level(width, height)
    level.board.load(bigint)
    level.board.buildClusters(PieceType.DUCK)
    level.board.buildClusters(PieceType.DUCKLING)
    level.board.buildClusters(PieceType.BOX)
    return level
}
