/** This file is part of Super Holy Chalice.
 * https://github.com/mvasilkov/super2023
 * @license GPLv3 | Copyright (c) 2023 Mark Vasilkov
 */
'use strict'

import { ShortBool } from '../node_modules/natlib/prelude.js'
import type { Board } from './Board'
import { PieceType, type Piece } from './Piece.js'

const collide: Set<PieceType> = new Set([PieceType.VOID])
const push: Set<PieceType> = new Set([PieceType.DUCKLING, PieceType.BOX])

export type MoveTuple = [piece: Piece, Δx: number, Δy: number]

export function cascadeMove(board: Board, piece: Piece, Δx: number, Δy: number, cause?: Readonly<Piece>): MoveTuple[] | undefined {
    const x = piece.x + Δx
    const y = piece.y + Δy
    if (x < 0 || y < 0 || x >= board.width || y >= board.height)
        // Out of bounds, stop
        return

    if (board.positions[y]![x]!.some(p => collide.has(p.type) && (!p.cluster || p.cluster !== piece.cluster)))
        // Collision, stop
        return

    // Moving a piece bound to a cluster pushes the entire cluster,
    // except if caused by another piece in that cluster.
    const cluster: Piece[] = (piece.cluster && piece.cluster !== cause?.cluster) ?
        piece.cluster.pieces.filter(p => p !== piece) : [] // .Inline(1)

    // Find pieces that'll be pushed this turn.
    // Pieces sharing a cluster with the current piece can't be pushed.
    const active: Piece[] = cluster.concat(board.positions[y]![x]!
        .filter(p => push.has(p.type) && (!p.cluster || p.cluster !== piece.cluster)))

    const cascade: MoveTuple[] = [[piece, Δx, Δy]]

    //#region Mutate the board (disabled)
    /*
    // Change the board state for the recursive calls.
    board.putPiece(piece, x, y)

    try {
    */
    //#endregion
    for (const other of active) {
        const dependencies = cascadeMove(board, other, Δx, Δy, piece)
        if (!dependencies)
            // Can't resolve, stop
            return

        cascade.push(...dependencies)
    }
    //#region Mutate the board (disabled)
    /*
    }
    finally {
        // Restore the board state.
        board.putPiece(piece, piece.x - Δx, piece.y - Δy)
    }
    */
    //#endregion

    // The direction doesn't change, so just dedup the pieces.
    const dedup: Set<Piece> = new Set
    return cascade.filter(([piece, ,]) =>
        dedup.has(piece) ? ShortBool.FALSE : dedup.add(piece))
}
