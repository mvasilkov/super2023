/** This file is part of Super Castle Game.
 * https://github.com/mvasilkov/super2023
 * @license GPLv3 | Copyright (c) 2023 Mark Vasilkov
 */
'use strict'

import { Settings, con } from './setup.js'

class Block {
    x: number
    y: number
    z: number

    constructor(x: number, y: number, z: number) {
        this.x = x
        this.y = y
        this.z = z
    }
}

const CASTLE_WIDTH = 7
const CASTLE_HEIGHT = 7
const CASTLE_DEPTH = 7

function buildCastle(): Block[] {
    const castle: Block[] = []

    for (let z = 0; z < CASTLE_DEPTH; ++z) {
        for (let x = 0; x < CASTLE_WIDTH; ++x) {
            for (let y = 0; y < CASTLE_HEIGHT; ++y) {
                // Walls
                if (x > 0 && x < CASTLE_WIDTH - 1 && y > 0 && y < CASTLE_HEIGHT - 1) {
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

                castle.push(new Block(x, y, z))
            }
        }
    }

    return castle
}

const castle = buildCastle()

export function paintCastle(t: number) {
    const size = 30
    const x0 = 0.5 * Settings.SCREEN_WIDTH
    const y0 = 0.5 * Settings.SCREEN_HEIGHT

    con.save()
    con.translate(x0, y0)

    castle.forEach(block => {
        drawIsoBlock(block.x * size, block.y * size, block.z * size, t * 0.47 * size)
    })

    con.restore()
}

function projectIsoVertex(x: number, y: number, z: number) {
    const isoX = (x - y) * Math.cos(Math.PI / 6)
    const isoY = -z + (x + y) * Math.sin(Math.PI / 6)
    return { x: isoX, y: isoY }
}

function drawIsoBlock(x: number, y: number, z: number, size: number) {
    const vertices = [
        { x: x - size, y: y - size, z: z - size }, // Front bottom left
        { x: x + size, y: y - size, z: z - size }, // Front bottom right
        { x: x + size, y: y + size, z: z - size }, // Front top right
        { x: x - size, y: y + size, z: z - size }, // Front top left
        { x: x - size, y: y - size, z: z + size }, // Back bottom left
        { x: x + size, y: y - size, z: z + size }, // Back bottom right
        { x: x + size, y: y + size, z: z + size }, // Back top right
        { x: x - size, y: y + size, z: z + size }  // Back top left
    ]

    // Define the cube's faces using vertex indices
    const faces = [
        // [vertices[0], vertices[1], vertices[2], vertices[3]], // Front face
        [vertices[4], vertices[5], vertices[6], vertices[7]], // Back face
        // [vertices[0], vertices[1], vertices[5], vertices[4]], // Bottom face
        [vertices[1], vertices[2], vertices[6], vertices[5]], // Right face
        [vertices[2], vertices[3], vertices[7], vertices[6]], // Top face
        // [vertices[0], vertices[3], vertices[7], vertices[4]]  // Left face
    ]

    const colors = [
        '#94b0c2',
        '#566c86',
        '#333c57',
    ]

    // Draw each face of the cube
    faces.forEach((face, index) => {
        con.beginPath()
        for (let n = 0; n < face.length; ++n) {
            const projectedVertex = projectIsoVertex(face[n]!.x, face[n]!.y, face[n]!.z)
            con.lineTo(projectedVertex.x, projectedVertex.y)
        }
        // con.closePath()
        con.fillStyle = colors[index]!
        con.fill()
    })
}
