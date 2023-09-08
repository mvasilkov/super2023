/** This file is part of Super Castle Game.
 * https://github.com/mvasilkov/super2023
 * @license GPLv3 | Copyright (c) 2023 Mark Vasilkov
 */
'use strict'

import { value as lv10value } from './pictures/10_entering.js'
import { value as lv20value } from './pictures/20_push_box.js'
import { value as lv30value } from './pictures/30_box_cutter.js'
import { value as lv40value } from './pictures/40_connect.js'
import { value as lv45value } from './pictures/45_push_connect.js'
import { value as lv50value } from './pictures/50_cutter.js'
import { value as lv55value } from './pictures/55_cutter_box.js'
import { value as lv60value } from './pictures/60_cutter_2.js'
import { value as lv100value } from './pictures/100_construct.js'
import { value as lv110value } from './pictures/110_push_box_2.js'
import { value as lv120value } from './pictures/120_cut_construct.js'
import { value as lv130value } from './pictures/130_cut_construct_2.js'

export const levels: readonly (string | undefined)[] = [
    ,
    lv10value,
    lv20value,
    lv30value,
    lv40value,
    lv45value,
    lv50value,
    lv55value,
    lv60value,
    lv100value,
    lv110value,
    lv120value,
    lv130value,
]
