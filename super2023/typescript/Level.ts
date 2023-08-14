/** This file is part of Super Holy Chalice.
 * https://github.com/mvasilkov/super2023
 * @license GPLv3 | Copyright (c) 2023 Mark Vasilkov
 */
'use strict'

import { Board } from './Board.js'
import { PieceType, type Piece } from './Piece.js'
import { Settings, con } from './setup.js'

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

    render() {
        for (let y = 0; y < this.board.height; ++y) {
            for (let x = 0; x < this.board.width; ++x) {
                const pieces = this.board.positions[y]![x]! // .Inline(1)

                pieces.forEach(piece => this.renderPiece(piece, x, y))
            }
        }
    }

    renderPiece(piece: Piece, x: number, y: number) {
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
