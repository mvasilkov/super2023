/** This file is part of Super Castle Game.
 * https://github.com/mvasilkov/super2023
 * @license GPLv3 | Copyright (c) 2023 Mark Vasilkov
 */
'use strict'

import { Input } from '../node_modules/natlib/controls/Keyboard.js'
import { ShortBool } from '../node_modules/natlib/prelude.js'
import { startMainloop } from '../node_modules/natlib/scheduling/mainloop.js'
import { Level, loadLevel } from './Level.js'
import { Cluster, PieceType, type Piece } from './Piece.js'
import { register0, register1 } from './Vec2.js'
import { SoundEffect, audioHandle, initializeAudio, sound, toggleAudio } from './audio/audio.js'
import { getGamepadDirection } from './gamepad.js'
import { renderIcons } from './icons.js'
import { renderIntro, renderIntroEnd } from './intro.js'
import { levels } from './levels.js'
import { enterPhase, interpolatePhase, updatePhase } from './natlib_state.js'
import { Palette, Settings, con, keyboard, pointer } from './setup.js'
import { DuckPhase, duckPhaseMap, duckState, oscillatorPhaseMap, oscillatorState } from './state.js'

let level: Level

try {
    level = loadLevel(location.hash.slice(1))
}
catch (err) {
    level = loadLevel(levels[1]!)
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
        // Click in the icons area
        const iconsAreaWidth3 = 3 * Settings.ICON_SIZE + 2.5 * Settings.ICON_SPACING // .Inline(1)
        const iconsAreaWidth2 = 2 * Settings.ICON_SIZE + 1.5 * Settings.ICON_SPACING // .Inline(1)
        const iconsAreaWidth1 = 1 * Settings.ICON_SIZE + 0.5 * Settings.ICON_SPACING // .Inline(1)

        if (pointer.x >= Settings.SCREEN_WIDTH - iconsAreaWidth3 && pointer.x < Settings.SCREEN_WIDTH && pointer.y < Settings.ICON_SIZE) {
            if (!duckState.pointerHeld) {
                duckState.pointerHeld = ShortBool.TRUE

                if (pointer.x >= Settings.SCREEN_WIDTH - iconsAreaWidth1) {
                    // Level select
                    console.log('Level select')
                }
                else if (pointer.x >= Settings.SCREEN_WIDTH - iconsAreaWidth2) {
                    // Reset
                    level = loadLevel(levels[duckState.levelIndex]!)
                }
                else {
                    // Toggle audio
                    toggleAudio(duckState.audioMuted = !duckState.audioMuted)
                }

                sound(SoundEffect.BUTTON_CLICK)
            }
            return
        }

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
    else duckState.pointerHeld = ShortBool.FALSE

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
                        level.discardPiece(piece)
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

                level.updateDucksOnGoal(level.ducksOnGoal)
                level.connectDucklings(ducks.filter(duck => !duck.killed))
            }
            // Could've changed in connectDucklings() or splitCluster()
            if (duckState.phase === DuckPhase.INTERACTIVE) {
                level.checkWin() || updateControls()
            }
            break

        case DuckPhase.ENTERING:
            if (oldPhase === DuckPhase.LEAVING) {
                level = loadLevel(levels[++duckState.levelIndex]!)
            }
    }

    updatePhase(oscillatorState, oscillatorPhaseMap)
}

function render(t: number) {
    const tOscillator = interpolatePhase(oscillatorState, Settings.OSCILLATOR_DURATION, t)

    con.fillStyle = Palette.NOTHING
    con.fillRect(0, 0, Settings.SCREEN_WIDTH, Settings.SCREEN_HEIGHT)

    if (duckState.phase === DuckPhase.TITLE_SCREEN) {
        renderIntro(t, tOscillator)
        return
    }

    level.render(t, tOscillator)

    renderIcons()

    if (duckState.phase === DuckPhase.LEAVING) {
        renderIntro(t, tOscillator)
    }
    else if (duckState.phase === DuckPhase.ENTERING) {
        renderIntroEnd(t, tOscillator)
    }
}

startMainloop(update, render)

// https://html.spec.whatwg.org/multipage/interaction.html#activation-triggering-input-event

document.addEventListener('mousedown', () => {
    if (audioHandle.initialized) return
    audioHandle.initialize(initializeAudio(pointer.x < 0.5 * Settings.SCREEN_WIDTH))
    enterPhase(duckState, DuckPhase.ENTERING, Settings.ENTER_DURATION)
}, { once: true })

document.addEventListener('touchend', () => {
    if (audioHandle.initialized) return
    audioHandle.initialize(initializeAudio(pointer.x < 0.5 * Settings.SCREEN_WIDTH))
    enterPhase(duckState, DuckPhase.ENTERING, Settings.ENTER_DURATION)
}, { once: true })
