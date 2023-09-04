/** This file is part of Super Castle Game.
 * https://github.com/mvasilkov/super2023
 * @license GPLv3 | Copyright (c) 2023 Mark Vasilkov
 */
'use strict'

import { height as lv10height, value as lv10value, width as lv10width } from './pictures/10_entering.js'
import { height as lv20height, value as lv20value, width as lv20width } from './pictures/20_push_box.js'
import { height as lv30height, value as lv30value, width as lv30width } from './pictures/30_box_cutter.js'
import { height as lv40height, value as lv40value, width as lv40width } from './pictures/40_connect.js'

type Level = [width: number, height: number, bigint: bigint]

export const levels: readonly (Level | undefined)[] = [
    ,
    [lv10width, lv10height, lv10value],
    [lv20width, lv20height, lv20value],
    [lv30width, lv30height, lv30value],
    [lv40width, lv40height, lv40value],
]
