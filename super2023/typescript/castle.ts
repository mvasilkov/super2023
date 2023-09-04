/** This file is part of Super Castle Game.
 * https://github.com/mvasilkov/super2023
 * @license GPLv3 | Copyright (c) 2023 Mark Vasilkov
 */
'use strict'

import { ShortBool } from '../node_modules/natlib/prelude.js'
import { Palette, Settings, con } from './setup.js'

const COS_30 = Math.cos(Math.PI / 6)
const SIN_30 = 0.5 // Math.sin(Math.PI / 6)

function projectIsoVertex(x: number, y: number, z: number, subpath: ShortBool = ShortBool.FALSE) {
    const xp = (x - y) * COS_30 + 0.5 * Settings.SCREEN_WIDTH
    const yp = -z + (x + y) * SIN_30 + 0.5 * Settings.SCREEN_HEIGHT
    subpath === ShortBool.FALSE ? con.lineTo(xp, yp) : con.moveTo(xp, yp)
}

function isoHash(x: number, y: number, z: number): number {
    return (x - y) * Settings.SCREEN_WIDTH + (x + y - z - z)
}

type Vertex3 = Parameters<typeof projectIsoVertex>

function renderFace(v0: Vertex3, v1: Vertex3, v2: Vertex3, v3: Vertex3, color: string) {
    con.beginPath()
    // for (let n = 0; n < 4; ++n) {
    //     projectIsoVertex(...face[n]!)
    // }
    projectIsoVertex(...v0)
    projectIsoVertex(...v1)
    projectIsoVertex(...v2)
    projectIsoVertex(...v3)
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
    renderFace(v4, v5, v6, v7, Palette.CASTLE)
    renderFace(v1, v2, v6, v5, Palette.CASTLE_2)
    renderFace(v2, v3, v7, v6, Palette.CASTLE_3)
}

function renderIsoBlockTop(x: number, y: number, z: number, size: number) {
    projectIsoVertex(x - size, y - size, z + size, ShortBool.TRUE)
    projectIsoVertex(x + size, y - size, z + size)
    projectIsoVertex(x + size, y + size, z + size)
    projectIsoVertex(x - size, y + size, z + size)
}

function renderIsoBlockRight(x: number, y: number, z: number, size: number) {
    projectIsoVertex(x + size, y - size, z - size, ShortBool.TRUE)
    projectIsoVertex(x + size, y + size, z - size)
    projectIsoVertex(x + size, y + size, z + size)
    projectIsoVertex(x + size, y - size, z + size)
}

function renderIsoBlockLeft(x: number, y: number, z: number, size: number) {
    projectIsoVertex(x + size, y + size, z - size, ShortBool.TRUE)
    projectIsoVertex(x - size, y + size, z - size)
    projectIsoVertex(x - size, y + size, z + size)
    projectIsoVertex(x + size, y + size, z + size)
}

const xs: number[] = []
const ys: number[] = []
const zs: number[] = []
const zstrides: number[] = []

function buildCastle() {
    const hashes: Set<number> = new Set

    for (let x: number = Settings.CASTLE_WIDTH; x--;) {
        for (let y: number = Settings.CASTLE_LENGTH; y--;) {
            let count = 0

            for (let z: number = Settings.CASTLE_HEIGHT; z--;) {
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

                const hash = isoHash(x, y, z)
                if (hashes.has(hash)) continue
                hashes.add(hash)

                xs.unshift(x * Settings.CASTLE_BLK_SIZE)
                ys.unshift(y * Settings.CASTLE_BLK_SIZE)
                zs.unshift(z * Settings.CASTLE_BLK_SIZE)

                ++count
            }

            if (count) zstrides.unshift(count)
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

export function renderCastle2(t: number, done: number) {
    const N = done * zstrides.length // done ∈ [0, 1]
    const size = t * Settings.CASTLE_BLK_SIZE * Settings.CASTLE_BLK_SCALE

    let p = 0
    for (let n = 0; n < N; ++n) {
        const count = zstrides[n]!

        con.beginPath()
        for (let q = p; q < p + count; ++q) {
            renderIsoBlockTop(xs[q]!, ys[q]!, zs[q]!, size)
        }
        con.fillStyle = Palette.CASTLE
        con.fill()

        con.beginPath()
        for (let q = p; q < p + count; ++q) {
            renderIsoBlockRight(xs[q]!, ys[q]!, zs[q]!, size)
        }
        con.fillStyle = Palette.CASTLE_2
        con.fill()

        con.beginPath()
        for (let q = p; q < p + count; ++q) {
            renderIsoBlockLeft(xs[q]!, ys[q]!, zs[q]!, size)
        }
        con.fillStyle = Palette.CASTLE_3
        con.fill()

        p += count
    }
}
