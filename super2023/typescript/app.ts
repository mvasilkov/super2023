/** This file is part of Super Castle Game.
 * https://github.com/mvasilkov/super2023
 * @license GPLv3 | Copyright (c) 2023 Mark Vasilkov
 */
'use strict'

import { Input } from '../node_modules/natlib/controls/Keyboard.js'
import { startMainloop } from '../node_modules/natlib/scheduling/mainloop.js'
import { enterPhase, updatePhase } from '../node_modules/natlib/state.js'
import { Level, loadLevel } from './Level.js'
import { Cluster, PieceType, type Piece } from './Piece.js'
import { register0, register1 } from './Vec2.js'
import { audioHandle, initializeAudio, sound } from './audio/audio.js'
import { getGamepadDirection } from './gamepad.js'
import { Palette, Settings, con, keyboard, pointer } from './setup.js'
import { DuckPhase, duckPhaseMap, duckState, oscillatorPhaseMap, oscillatorState } from './state.js'

let level: Level

try {
    level = loadLevel()
}
catch (err) {
    //#region TODO delete
    level = new Level(16, 16)

    level.board.createPiece(PieceType.BOX, 3, 3)
    level.board.createPiece(PieceType.BOX, 4, 3)
    level.board.createPiece(PieceType.BOX, 3, 4)
    level.board.createPiece(PieceType.BOX, 4, 4)
    level.board.createPiece(PieceType.BOX, 3, 5)
    level.board.createPiece(PieceType.BOX, 4, 5)
    level.board.createPiece(PieceType.BOX, 3, 6)
    level.board.createPiece(PieceType.BOX, 4, 6)

    new Cluster([
        level.board.createPiece(PieceType.DUCKLING, 6, 5),
    ])

    level.board.createPiece(PieceType.CUTTER, 5, 6)
    level.board.createPiece(PieceType.CUTTER, 6, 6)
    level.board.createPiece(PieceType.CUTTER, 7, 6)

    new Cluster([
        level.board.createPiece(PieceType.DUCK, 8, 7),
        level.board.createPiece(PieceType.DUCK, 7, 8),
        level.board.createPiece(PieceType.DUCK, 8, 8),
        level.board.createPiece(PieceType.DUCK, 9, 8),
        level.board.createPiece(PieceType.DUCK, 8, 9),
    ])

    level.board.createPiece(PieceType.GOAL, 10, 8)
    level.board.createPiece(PieceType.GOAL, 11, 8)
    level.board.createPiece(PieceType.GOAL, 12, 8)
    level.board.createPiece(PieceType.GOAL, 11, 9)

    new Cluster([
        level.board.createPiece(PieceType.DUCKLING, 5, 11),
        level.board.createPiece(PieceType.DUCKLING, 4, 12),
        level.board.createPiece(PieceType.DUCKLING, 5, 12),
        level.board.createPiece(PieceType.DUCKLING, 6, 12),
    ])

    new Cluster([
        level.board.createPiece(PieceType.DUCKLING, 3, 13),
        level.board.createPiece(PieceType.DUCKLING, 4, 13),
        level.board.createPiece(PieceType.DUCKLING, 5, 13),
        level.board.createPiece(PieceType.DUCKLING, 4, 14),
    ])

    for (let n = 0; n < 16; ++n) {
        level.board.createPiece(PieceType.VOID, n, 0)
        level.board.createPiece(PieceType.VOID, n, 15)
        level.board.createPiece(PieceType.VOID, 0, n)
        level.board.createPiece(PieceType.VOID, 15, n)
    }

    level.board.buildClusters(PieceType.BOX)
    //#endregion
}

type MoveScalar = -1 | 0 | 1
type MoveScalarNonzero = -1 | 1

function updateControls() {
    const left = keyboard.state[Input.LEFT] || keyboard.state[Input.LEFT_A]
    const up = keyboard.state[Input.UP] || keyboard.state[Input.UP_W]
    const right = keyboard.state[Input.RIGHT] || keyboard.state[Input.RIGHT_D]
    const down = keyboard.state[Input.DOWN] || keyboard.state[Input.DOWN_S]

    // Left XOR right || up XOR down
    if ((left ? !right : right) || (up ? !down : down)) {
        const ducks = level.board.pieces[PieceType.DUCK] ?? []
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

    if (pointer.held) {
        const ducks = level.board.pieces[PieceType.DUCK] ?? []
        if (!ducks.length) return

        // Pointer position in board coordinates
        register0.set(
            (pointer.x - level.boardLeft) / level.cellSize - 0.5,
            (pointer.y - level.boardTop) / level.cellSize - 0.5)

        // Centroid of ducks
        register1.set(
            ducks.reduce((xs, duck) => xs + duck.x, 0) / ducks.length,
            ducks.reduce((ys, duck) => ys + duck.y, 0) / ducks.length)

        let Δx: number, Δy: number
        const x = Math.abs(Δx = register0.x - register1.x)
        const y = Math.abs(Δy = register0.y - register1.y)

        if (x < y) {
            if (y < Settings.POINTER_DEAD_ZONE) return
            Δy = Δy < 0 ? -1 : 1
            ducks.sort((a, b) => Δy * (b.y - a.y))
            level.tryMove(ducks[0]!, 0, Δy as MoveScalarNonzero)
        }
        else {
            if (x < Settings.POINTER_DEAD_ZONE) return
            Δx = Δx < 0 ? -1 : 1
            ducks.sort((a, b) => Δx * (b.x - a.x))
            level.tryMove(ducks[0]!, Δx as MoveScalarNonzero, 0)
        }
    }

    const direction = getGamepadDirection()
    if (direction) {
        const ducks = level.board.pieces[PieceType.DUCK] ?? []
        if (!ducks.length) return

        if (direction.x) {
            ducks.sort((a, b) => direction.x * (b.x - a.x))
            if (!level.tryMove(ducks[0]!, direction.x as MoveScalarNonzero, 0)) return
        }

        if (direction.y) {
            ducks.sort((a, b) => direction.y * (b.y - a.y))
            if (!level.tryMove(ducks[0]!, 0, direction.y as MoveScalarNonzero)) return
        }
    }
}

function update() {
    const oldPhase = updatePhase(duckState, duckPhaseMap)

    switch (duckState.phase) {
        case DuckPhase.INTERACTIVE:
            if (oldPhase === DuckPhase.MOVING || oldPhase === DuckPhase.CONNECTING) {
                const ducks: Piece[] = []
                const updateClusters: Set<Cluster> = new Set

                for (const piece of level.active) {
                    if (piece.killed) {
                        level.board.discardPiece(piece)
                        if (piece.cluster) {
                            // new Cluster(piece.cluster.pieces.filter(p => p !== piece))
                            updateClusters.add(piece.cluster)
                        }
                        continue
                    }

                    // Does nothing if oldPhase === DuckPhase.CONNECTING
                    piece.oldPosition.copy(piece)

                    if (piece.type === PieceType.DUCK) {
                        ducks.push(piece)
                    }
                }
                level.active.clear()

                // Split clusters
                updateClusters.forEach(cluster => {
                    level.splitCluster(cluster)
                })

                level.updateDucksOnGoal(duckState.ducksOnGoal)
                level.connectDucklings(ducks.filter(duck => !duck.killed))
            }
            // Could've changed in connectDucklings() or splitCluster()
            if (duckState.phase === DuckPhase.INTERACTIVE) {
                updateControls()
            }
    }

    updatePhase(oscillatorState, oscillatorPhaseMap)
}

function render(t: number) {
    con.fillStyle = Palette.NOTHING
    con.fillRect(0, 0, Settings.SCREEN_WIDTH, Settings.SCREEN_HEIGHT)

    level.render(t)
}

startMainloop(update, render)

// TODO delete
!((window as any)['leave'] = () => {
    enterPhase(duckState, DuckPhase.LEAVING, Settings.LEAVE_DURATION)
})

// TODO delete
!((window as any)['sound'] = sound)

// TODO delete
document.body.addEventListener('click', () => {
    if (!audioHandle.initialized) audioHandle.initialize(initializeAudio)
})
