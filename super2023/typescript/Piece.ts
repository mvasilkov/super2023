/** This file is part of Super Holy Chalice.
 * https://github.com/mvasilkov/super2023
 * @license GPLv3 | Copyright (c) 2023 Mark Vasilkov
 */
'use strict'

import { Vec2 } from '../node_modules/natlib/Vec2.js'
import type { ExtendedBool } from '../node_modules/natlib/prelude'

export const enum PieceType {
    VOID,
    DUCK,
    DUCKLING,
    BOX,
    CUTTER,
    GOAL,
}

export class Piece<T extends PieceType = PieceType> extends Vec2 {
    readonly type: PieceType
    readonly oldPosition: Vec2
    cluster?: Cluster<T>
    killed?: ExtendedBool

    constructor(type: T, x: number, y: number) {
        super(x, y)
        this.type = type
        this.oldPosition = new Vec2(x, y)
    }
}

export class Cluster<T extends PieceType = PieceType> {
    readonly pieces: readonly Piece<T>[]

    constructor(pieces: readonly Piece<T>[]) {
        (this.pieces = pieces).forEach(p => p.cluster = this)
    }
}
