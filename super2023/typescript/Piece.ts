/** This file is part of Super Castle Game.
 * https://github.com/mvasilkov/super2023
 * @license GPLv3 | Copyright (c) 2023 Mark Vasilkov
 */
'use strict'

import type { ExtendedBool } from '../node_modules/natlib/prelude'
import { Vec2 } from './Vec2.js'

export const enum PieceType {
    VOID,
    DUCK,
    DUCKLING,
    GOAL,
    BOX,
    CUTTER,
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
