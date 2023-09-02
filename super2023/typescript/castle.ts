/** This file is part of Super Castle Game.
 * https://github.com/mvasilkov/super2023
 * @license GPLv3 | Copyright (c) 2023 Mark Vasilkov
 */
'use strict'

import { Palette, Settings, con } from './setup.js'

const COS_30 = Math.cos(Math.PI / 6)
const SIN_30 = Math.sin(Math.PI / 6)

function projectIsoVertex(x: number, y: number, z: number): [x: number, y: number] {
    const xp = (x - y) * COS_30 + 0.5 * Settings.SCREEN_WIDTH
    const yp = -z + (x + y) * SIN_30 + 0.5 * Settings.SCREEN_HEIGHT
    return [xp, yp]
}

type Vertex3 = Parameters<typeof projectIsoVertex>

function renderFace(face: readonly Vertex3[], color: string) {
    con.beginPath()
    for (let n = 0; n < 4; ++n) {
        con.lineTo(...projectIsoVertex(...face[n]!))
    }
    con.fillStyle = color
    con.fill()
}

function renderIsoBlock(x: number, y: number, z: number, size: number) {
    // Vertices
    const v1: Vertex3 = [x + size, y - size, z - size]
    const v2: Vertex3 = [x + size, y + size, z - size]
    const v3: Vertex3 = [x - size, y + size, z - size]
    const v4: Vertex3 = [x - size, y - size, z + size]
    const v5: Vertex3 = [x + size, y - size, z + size]
    const v6: Vertex3 = [x + size, y + size, z + size]
    const v7: Vertex3 = [x - size, y + size, z + size]
    // Faces
    renderFace([v4, v5, v6, v7], Palette.CASTLE)
    renderFace([v1, v2, v6, v5], Palette.CASTLE_2)
    renderFace([v2, v3, v7, v6], Palette.CASTLE_3)
}

const xs: number[] = []
const ys: number[] = []
const zs: number[] = []

function buildCastle() {
    for (let z = 0; z < Settings.CASTLE_HEIGHT; ++z) {
        for (let y = 0; y < Settings.CASTLE_LENGTH; ++y) {
            for (let x = 0; x < Settings.CASTLE_WIDTH; ++x) {
                // Walls
                if (x > 0 && x < Settings.CASTLE_WIDTH - 1 && y > 0 && y < Settings.CASTLE_LENGTH - 1) {
                    continue
                }
                // Gate
                if (Math.hypot(x - 7, y - 3, z - 1) < 2) {
                    continue
                }
                // Windows
                if (z > 2 && z < 5 && (x === 2 || x === 4)) {
                    continue
                }
                // Crenellations
                if (z > 5 && ((x & 1) | (y & 1))) {
                    continue
                }

                xs.push(x * Settings.CASTLE_BLK_SIZE)
                ys.push(y * Settings.CASTLE_BLK_SIZE)
                zs.push(z * Settings.CASTLE_BLK_SIZE)
            }
        }
    }
}

buildCastle()

export function renderCastle(t: number, done: number) {
    const N = done * xs.length // done ∈ [0, 1]
    const size = t * Settings.CASTLE_BLK_SIZE * Settings.CASTLE_BLK_SCALE

    for (let n = 0; n < N; ++n) {
        renderIsoBlock(xs[n]!, ys[n]!, zs[n]!, size)
    }
}
