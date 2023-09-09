/** This file is part of Super Castle Game.
 * https://github.com/mvasilkov/super2023
 * @license GPLv3 | Copyright (c) 2023 Mark Vasilkov
 */
'use strict'

import { easeInOutQuad, easeOutQuad, lerp } from '../node_modules/natlib/interpolation.js'
import { ShortBool, type ExtendedBool } from '../node_modules/natlib/prelude.js'
import { Board } from './Board.js'
import { Cluster, PieceType, type Piece } from './Piece.js'
import { enterPhase, interpolatePhase } from './natlib_state.js'
import { cascadeMove } from './rules.js'
import {
    COLOR_DUCK_2_B,
    COLOR_DUCK_2_G,
    COLOR_DUCK_2_R,
    COLOR_DUCK_B,
    COLOR_DUCK_G,
    COLOR_DUCK_R,
    COLOR_GOAL_2_B,
    COLOR_GOAL_2_G,
    COLOR_GOAL_2_R,
    COLOR_GOAL_B,
    COLOR_GOAL_G,
    COLOR_GOAL_R,
    Palette,
    Settings,
    con,
    linearToSrgb,
    oscillate,
    wrapAround,
} from './setup.js'
import { DuckPhase, duckState } from './state.js'

export class Level {
    readonly board: Board
    readonly active: Set<Piece>
    readonly ducksOnGoal: Set<Piece>
    readonly ducksOnGoalNext: Set<Piece>
    // Rendering properties
    readonly cellSize: number
    readonly boardLeft: number
    readonly boardTop: number

    constructor(width: number, height: number) {
        this.board = new Board(width, height)
        this.active = new Set
        /*@__MANGLE_PROP__*/
        this.ducksOnGoal = new Set
        /*@__MANGLE_PROP__*/
        this.ducksOnGoalNext = new Set

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

        this.updateDucksOnGoal(this.ducksOnGoalNext)
        enterPhase(duckState, DuckPhase.MOVING, Settings.MOVE_DURATION)
        // .DeadCode
        return
        // .EndDeadCode
    }

    discardPiece(piece: Readonly<Piece>) {
        this.board.discardPiece(piece)

        if (piece.type === PieceType.DUCK) {
            this.ducksOnGoal.delete(piece)
            this.ducksOnGoalNext.delete(piece)
        }
    }

    /*@__MANGLE_PROP__*/
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
                this.discardPiece(duckling)
                const duck = this.board.createPiece(PieceType.DUCK, duckling.x, duckling.y)
                this.active.add(duck)
            })
        })

        new Cluster(this.board.pieces[PieceType.DUCK]!)

        // Pieces just created could've appeared on goal.
        this.updateDucksOnGoal(this.ducksOnGoalNext)

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
                    this.discardPiece(duck)
                    const duckling = this.board.createPiece(PieceType.DUCKLING, duck.x, duck.y)
                    this.active.add(duckling)
                    ducklings.push(duckling)
                })
                new Cluster(ducklings)
            }

            enterPhase(duckState, DuckPhase.CONNECTING, Settings.CONNECT_DURATION)
        }
    }

    /** Return TRUE if the level is won. */
    checkWin(): ExtendedBool {
        const duckCount = this.board.pieces[PieceType.DUCK]?.length
        const goalCount = this.board.pieces[PieceType.GOAL]?.length
        if (duckCount === goalCount && duckCount === this.ducksOnGoal.size && duckCount === this.ducksOnGoalNext.size) {
            enterPhase(duckState, DuckPhase.LEAVING, Settings.LEAVE_DURATION)
            return ShortBool.TRUE
        }
        // .DeadCode
        return
        // .EndDeadCode
    }

    render(t: number, tOscillator: number) {
        const tDuck = duckState.phase === DuckPhase.MOVING ?
            easeInOutQuad(interpolatePhase(duckState, Settings.MOVE_DURATION, t)) :
            duckState.phase === DuckPhase.CONNECTING ?
                easeInOutQuad(interpolatePhase(duckState, Settings.CONNECT_DURATION, t)) : 0

        const colorDuckEntering = '#' +
            linearToSrgb(lerp(COLOR_GOAL_R, COLOR_DUCK_R, tDuck)) +
            linearToSrgb(lerp(COLOR_GOAL_G, COLOR_DUCK_G, tDuck)) +
            linearToSrgb(lerp(COLOR_GOAL_B, COLOR_DUCK_B, tDuck)) // .Inline(1)
        const secondaryColorDuckEntering = '#' +
            linearToSrgb(lerp(COLOR_GOAL_2_R, COLOR_DUCK_2_R, tDuck)) +
            linearToSrgb(lerp(COLOR_GOAL_2_G, COLOR_DUCK_2_G, tDuck)) +
            linearToSrgb(lerp(COLOR_GOAL_2_B, COLOR_DUCK_2_B, tDuck)) // .Inline(1)

        const colorDuckLeaving = '#' +
            linearToSrgb(lerp(COLOR_DUCK_R, COLOR_GOAL_R, tDuck)) +
            linearToSrgb(lerp(COLOR_DUCK_G, COLOR_GOAL_G, tDuck)) +
            linearToSrgb(lerp(COLOR_DUCK_B, COLOR_GOAL_B, tDuck)) // .Inline(1)
        const secondaryColorDuckLeaving = '#' +
            linearToSrgb(lerp(COLOR_DUCK_2_R, COLOR_GOAL_2_R, tDuck)) +
            linearToSrgb(lerp(COLOR_DUCK_2_G, COLOR_GOAL_2_G, tDuck)) +
            linearToSrgb(lerp(COLOR_DUCK_2_B, COLOR_GOAL_2_B, tDuck)) // .Inline(1)

        const duckColors = [Palette.DUCK, colorDuckEntering, colorDuckLeaving, Palette.DUCK_ON_GOAL]
        const duckSecondaryColors = [Palette.DUCK_2, secondaryColorDuckEntering, secondaryColorDuckLeaving, Palette.DUCK_ON_GOAL_2]

        con.fillStyle = Palette.BOARD
        con.fillRect(this.boardLeft, this.boardTop, this.board.width * this.cellSize, this.board.height * this.cellSize)

        // Grid
        con.beginPath()
        const size = Math.max(this.board.width, this.board.height)
        for (let n = 1; n < size; ++n) {
            if (n < this.board.width) {
                con.moveTo(this.boardLeft + n * this.cellSize, this.boardTop)
                con.lineTo(this.boardLeft + n * this.cellSize, this.boardTop + this.board.height * this.cellSize)
            }

            if (n < this.board.height) {
                con.moveTo(this.boardLeft, this.boardTop + n * this.cellSize)
                con.lineTo(this.boardLeft + this.board.width * this.cellSize, this.boardTop + n * this.cellSize)
            }
        }
        con.strokeStyle = Palette.GRID
        con.stroke()

        // Floor tiles
        this.board.pieces[PieceType.GOAL]?.forEach(piece =>
            this.renderPiece(piece, piece.x, piece.y, tDuck, 0, duckColors, duckSecondaryColors))

        // Blocks
        for (let y = 0; y < this.board.height; ++y) {
            for (let x = 0; x < this.board.width; ++x) {
                const pieces = this.board.positions[y]![x]! // .Inline(1)
                const tVibe = wrapAround(tOscillator + Settings.OSCILLATOR_INCREMENT * (x - 0.85 * y))

                pieces.forEach(piece => piece.type !== PieceType.GOAL && this.renderPiece(piece, x, y, tDuck, tVibe, duckColors, duckSecondaryColors))
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

        let size = this.cellSize
        x = x * size + this.boardLeft
        y = y * size + this.boardTop

        if (piece.type === PieceType.VOID) {
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

            return
        }
        if (piece.type === PieceType.GOAL) {
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

            return
        }

        x -= Settings.BLOCK_GROW
        y -= Settings.BLOCK_GROW
        size += 2 * Settings.BLOCK_GROW

        if (piece.killed) {
            size = lerp(size, 0, tDuck) // .InlineExp
            const padding = 0.5 * (this.cellSize - size)
            x += padding
            y += padding
        }

        const bh = Settings.BLOCK_HEIGHT * size

        switch (piece.type) {
            case PieceType.DUCK:
                const colorIndex = (this.ducksOnGoal.has(piece) ? 1 : 0) + (this.ducksOnGoalNext.has(piece) ? 2 : 0)

                paintBlock(x, y, size, bh, duckColors[colorIndex]!, duckSecondaryColors[colorIndex]!, 0, Settings.BLOCK_REFLECTION_OPACITY)

                if (colorIndex === 3) {
                    con.beginPath()
                    con.moveTo(x + 0.2 * size, y - bh + 0.5 * size)
                    con.lineTo(x + 0.4 * size, y - bh + 0.7 * size)
                    con.lineTo(x + 0.8 * size, y - bh + 0.3 * size)
                    con.strokeStyle = Palette.DUCK_ON_GOAL_2
                    con.stroke()
                }
                else if (colorIndex === 0 && this.ducksOnGoal.size && this.ducksOnGoalNext.size) {
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

                    paintBlock(x, y, size, bh, Palette.DUCKLING, Palette.DUCKLING_2, progress)
                }
                break
            case PieceType.DUCKLING:
                paintBlock(x, y, size, bh, Palette.DUCKLING, Palette.DUCKLING_2, 0, Settings.BLOCK_REFLECTION_OPACITY)

                if (duckState.phase === DuckPhase.CONNECTING && this.active.has(piece)) {
                    const progress = size * tDuck // .Inline(1)

                    paintBlock(x, y, size, bh, Palette.DUCK, Palette.DUCK_2, progress)
                }
                break
            case PieceType.BOX:
                paintBlock(x, y, size, bh, Palette.BOX, Palette.BOX_2, 0, Settings.BLOCK_REFLECTION_OPACITY)

                con.beginPath()
                con.arc(x + 0.5 * size, y - bh + 0.5 * size, 0.3 * size, 0, 2 * Math.PI)
                con.strokeStyle = Palette.BOX_2
                con.stroke()
                break
            case PieceType.CUTTER:
                const height = (0.9 * easeOutQuad(oscillate(tVibe)) + 0.1) * bh

                con.beginPath()
                con.lineTo(x + 0.8 * size, y + 0.5 * size)
                con.arc(x + 0.5 * size, y + height + 0.5 * size, 0.3 * size, 0, Math.PI)
                con.lineTo(x + 0.2 * size, y + 0.5 * size)
                con.fillStyle = Palette.CUTTER_2 + Settings.BLOCK_REFLECTION_OPACITY
                con.fill()

                con.beginPath()
                con.lineTo(x + 0.8 * size, y - height + 0.5 * size)
                con.arc(x + 0.5 * size, y + 0.5 * size, 0.3 * size, 0, Math.PI)
                con.lineTo(x + 0.2 * size, y - height + 0.5 * size)
                con.fillStyle = Palette.CUTTER_2
                con.fill()

                con.beginPath()
                con.arc(x + 0.5 * size, y - height + 0.5 * size, 0.3 * size, 0, 2 * Math.PI)
                con.fillStyle = Palette.CUTTER
                con.fill()
        }
    }
}

function paintBlock(
    x: number,
    y: number,
    size: number,
    height: number,
    color: string,
    color2: string,
    progress: number,
    reflectionOpacity?: number) {

    if (reflectionOpacity) {
        con.fillStyle = color2 + reflectionOpacity
        con.fillRect(x, y + size - Settings.BLOCK_GROW, size, height + Settings.BLOCK_GROW)
    }

    con.fillStyle = color2
    con.fillRect(x + progress, y - height + size - Settings.BLOCK_GROW, size - progress, height + Settings.BLOCK_GROW)

    con.fillStyle = color
    con.fillRect(x + progress, y - height, size - progress, size)
}

export function loadLevel(string: string): Level {
    const width = parseInt(string.slice(0, 2), 16)
    const height = parseInt(string.slice(2, 4), 16)
    const bigint = BigInt('0x' + string.slice(4))

    const level = new Level(width, height)
    level.board.load(bigint)
    const clusterTypes = [PieceType.DUCK, PieceType.DUCKLING, PieceType.BOX]
    clusterTypes.forEach(type => level.board.buildClusters(type))

    return level
}
