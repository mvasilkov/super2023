/** This file is part of Super Holy Chalice.
 * https://github.com/mvasilkov/super2023
 * @license GPLv3 | Copyright (c) 2023 Mark Vasilkov
 */
'use strict'

import { ShortBool } from '../node_modules/natlib/prelude.js'
import { Cluster, Piece, PieceType } from './Piece.js'

export class Board {
    readonly width: number
    readonly height: number
    /** Pieces indexed by type */
    readonly pieces: { [T in PieceType]?: Piece<T>[] }
    /** Pieces indexed by position on the board */
    readonly positions: Piece[][][]

    constructor(width: number, height: number) {
        this.width = width
        this.height = height

        this.pieces = {}
        this.positions = Array.from({ length: height },
            () => Array.from({ length: width }, () => []))
    }

    createPiece<T extends PieceType = PieceType>(type: T, x: number, y: number): Piece<T> {
        const piece = new Piece(type, x, y)

        this.pieces[type] ??= [] // .InlineExp
        this.pieces[type]!.push(piece)

        this.positions[y]![x]!.push(piece)

        return piece
    }

    discardPiece(piece: Piece) {
        let stack = this.pieces[piece.type]!
        stack.splice(stack.indexOf(piece), 1)

        stack = this.positions[piece.y]![piece.x]!
        stack.splice(stack.indexOf(piece), 1)
    }

    /** Move a piece to a position on the board. */
    putPiece(piece: Piece, x: number, y: number) {
        const stack = this.positions[piece.y]![piece.x]!
        stack.splice(stack.indexOf(piece), 1)

        this.positions[y]![x]!.push(piece.set(x, y))
    }

    getBorderingPieces<T extends PieceType>(piece: Readonly<Piece>, type: T): Piece<T>[] | undefined {
        return this.pieces[type]?.filter(p => p.distanceSquared(piece) === 1)
    }

    hasBorderingPieces(piece: Readonly<Piece>, type: PieceType): boolean | undefined {
        return this.pieces[type]?.some(p => p.distanceSquared(piece) === 1)
    }

    /** Get a group of adjacent pieces of identical type. */
    getGroup(piece: Piece): Set<Piece> {
        const group = new Set<Piece>([piece])
        const stack = [piece]

        while (stack.length) {
            const piece = stack.pop()!

            this.getBorderingPieces(piece, piece.type)!.forEach(other => {
                if (group.has(other)) return

                group.add(other)
                stack.push(other)
            })
        }

        return group
    }

    buildClusters(type: PieceType) {
        const pieces: Set<Piece> = new Set(this.pieces[type])

        for (const piece of pieces) {
            const cluster = new Cluster([...this.getGroup(piece)])
            cluster.pieces.forEach(p => pieces.delete(p))
        }
    }

    splitCluster(cluster: Cluster) {
        const type = cluster.pieces[0]!.type
        const pieces = new Set(cluster.pieces.filter(p => !p.killed))
        const clusters: Cluster[] = []

        for (const piece of pieces) {
            cluster = new Cluster([...this.getGroup(piece)])
            cluster.pieces.forEach(p => pieces.delete(p))
            clusters.push(cluster)
        }

        if (type === PieceType.DUCK && clusters.length > 1) {
            clusters.sort((a, b) => b.pieces.length - a.pieces.length)

            for (let n = 1; n < clusters.length; ++n) {
                const ducklings: Piece<PieceType.DUCKLING>[] = []
                clusters[n]!.pieces.forEach(duck => {
                    duck.killed = ShortBool.TRUE
                    this.discardPiece(duck)
                    const duckling = this.createPiece(PieceType.DUCKLING, duck.x, duck.y)
                    ducklings.push(duckling)
                })
                new Cluster(ducklings)
            }
        }
    }
}
