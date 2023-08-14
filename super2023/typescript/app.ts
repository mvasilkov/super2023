/** This file is part of Super Holy Chalice.
 * https://github.com/mvasilkov/super2023
 * @license GPLv3 | Copyright (c) 2023 Mark Vasilkov
 */
'use strict'

import { startMainloop } from '../node_modules/natlib/scheduling/mainloop.js'
import { Level } from './Level.js'
import { Cluster, PieceType } from './Piece.js'
import { Settings, con } from './setup.js'

//#region Move to another file
const level = new Level(16, 16)

new Cluster([
    level.board.createPiece(PieceType.DUCK, 8, 7),
    level.board.createPiece(PieceType.DUCK, 7, 8),
    level.board.createPiece(PieceType.DUCK, 8, 8),
    level.board.createPiece(PieceType.DUCK, 9, 8),
    level.board.createPiece(PieceType.DUCK, 8, 9),
])

new Cluster([
    level.board.createPiece(PieceType.DUCKLING, 5, 11),
    level.board.createPiece(PieceType.DUCKLING, 4, 12),
    level.board.createPiece(PieceType.DUCKLING, 5, 12),
    level.board.createPiece(PieceType.DUCKLING, 6, 12),
])
//#endregion

function update() {
}

function render() {
    con.fillStyle = '#1a1c2c'
    con.fillRect(0, 0, Settings.SCREEN_WIDTH, Settings.SCREEN_HEIGHT)

    level.render()
}

startMainloop(update, render)
