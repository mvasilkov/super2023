/** This file is part of Super Holy Chalice.
 * https://github.com/mvasilkov/super2023
 * @license GPLv3 | Copyright (c) 2023 Mark Vasilkov
 */
'use strict'

import type { Board } from './Board'
import { PieceType, type Piece } from './Piece.js'

const collide: Set<PieceType> = new Set([PieceType.VOID, PieceType.DUCK])
const push: Set<PieceType> = new Set([PieceType.DUCKLING])

export type MoveTuple = [piece: Piece, Δx: number, Δy: number]

export function cascadeMove(board: Board, piece: Piece, Δx: number, Δy: number, cause?: Readonly<Piece>): MoveTuple[] | undefined {
    const x = piece.x + Δx
    const y = piece.y + Δy
    if (x < 0 || y < 0 || x >= board.width || y >= board.height)
        // Out of bounds, stop
        return

    if (board.positions[y]![x]!.some(p => collide.has(p.type)))
        // Collision, stop
        return

    // Moving a piece bound to a cluster pushes the entire cluster,
    // except if caused by another piece in that cluster.
    const cluster: Piece[] = (piece.cluster && piece.cluster !== cause?.cluster) ?
        piece.cluster.pieces.filter(p => p !== piece) : []

    // Find pieces that'll be pushed this turn.
    // Pieces sharing a cluster with the current piece can't be pushed.
    const active: Piece[] = cluster.concat(board.positions[y]![x]!
        .filter(p => push.has(p.type) && (!p.cluster || p.cluster !== piece.cluster)))

    const cascade: MoveTuple[] = [[piece, Δx, Δy]]

    for (const other of active) {
        const dependencies = cascadeMove(board, other, Δx, Δy, piece)
        if (!dependencies)
            // Can't resolve, stop
            return

        cascade.push(...dependencies)
    }

    return cascade
}
