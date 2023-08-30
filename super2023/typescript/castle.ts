/** This file is part of Super Castle Game.
 * https://github.com/mvasilkov/super2023
 * @license GPLv3 | Copyright (c) 2023 Mark Vasilkov
 */
'use strict'

// import { paintBlock } from './Level.js'
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

const CASTLE_WIDTH = 8
const CASTLE_HEIGHT = 8
const CASTLE_DEPTH = 8

function buildCastle(): Block[] {
    const castle: Block[] = []

    for (let x = 0; x < CASTLE_WIDTH; ++x) {
        for (let y = 0; y < CASTLE_HEIGHT; ++y) {
            for (let z = 0; z < CASTLE_DEPTH; ++z) {
                if (x > 0 && x < CASTLE_WIDTH - 1 && y > 0 && y < CASTLE_HEIGHT - 1) {
                    continue
                }

                castle.push(new Block(x, y, z))
            }
        }
    }

    return castle
}

const castle = buildCastle()

export function paintCastle() {
    const size = 30
    const x0 = 0.5 * Settings.SCREEN_WIDTH
    const y0 = 0.5 * Settings.SCREEN_HEIGHT

    con.save()
    con.translate(x0, y0)

    castle.forEach(block => {
        drawIsoBlock(block.x * size, block.y * size, block.z * size, size)
    })

    con.restore()
}

function projectIsoVertex(x: number, y: number, z: number) {
    const isoX = (x - y) * Math.cos(Math.PI / 6)
    const isoY = -z + (x + y) * Math.sin(Math.PI / 6)
    return { x: isoX, y: isoY }
}

function drawIsoBlock(x0: number, y0: number, z0: number, size: number) {
    const vertices = [
        { x: x0 - size / 2, y: y0 - size / 2, z: z0 - size / 2 }, // Front bottom left
        { x: x0 + size / 2, y: y0 - size / 2, z: z0 - size / 2 }, // Front bottom right
        { x: x0 + size / 2, y: y0 + size / 2, z: z0 - size / 2 }, // Front top right
        { x: x0 - size / 2, y: y0 + size / 2, z: z0 - size / 2 }, // Front top left
        { x: x0 - size / 2, y: y0 - size / 2, z: z0 + size / 2 }, // Back bottom left
        { x: x0 + size / 2, y: y0 - size / 2, z: z0 + size / 2 }, // Back bottom right
        { x: x0 + size / 2, y: y0 + size / 2, z: z0 + size / 2 }, // Back top right
        { x: x0 - size / 2, y: y0 + size / 2, z: z0 + size / 2 }  // Back top left
    ]

    // Define the cube's faces using vertex indices
    const faces = [
        // [vertices[0], vertices[1], vertices[2], vertices[3]], // Front face
        [vertices[4], vertices[5], vertices[6], vertices[7]], // Back face
        // [vertices[0], vertices[1], vertices[5], vertices[4]], // Bottom face
        [vertices[2], vertices[3], vertices[7], vertices[6]], // Top face
        [vertices[1], vertices[2], vertices[6], vertices[5]], // Right face
        // [vertices[0], vertices[3], vertices[7], vertices[4]]  // Left face
    ]

    con.fillStyle = 'rgba(0, 150, 255, 0.5)'
    con.strokeStyle = '#ff0080'

    // Draw each face of the cube
    for (const face of faces) {
        con.beginPath()
        for (let i = 0; i < face.length; i++) {
            const projectedVertex = projectIsoVertex(face[i]!.x, face[i]!.y, face[i]!.z)
            con.lineTo(projectedVertex.x, projectedVertex.y)
        }
        con.closePath()
        con.fill()
        con.stroke()
    }
}
