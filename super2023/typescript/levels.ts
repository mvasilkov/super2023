/** This file is part of Super Castle Game.
 * https://github.com/mvasilkov/super2023
 * @license GPLv3 | Copyright (c) 2023 Mark Vasilkov
 */
'use strict'

import { height as lv10height, value as lv10value, width as lv10width } from './pictures/10_entering.js'

type Level = [width: number, height: number, bigint: bigint]

export const levels: readonly (Level | undefined)[] = [
    ,
    [lv10width, lv10height, lv10value],
]
