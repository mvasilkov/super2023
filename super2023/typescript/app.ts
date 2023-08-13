/** This file is part of Super Holy Chalice.
 * https://github.com/mvasilkov/super2023
 * @license GPLv3 | Copyright (c) 2023 Mark Vasilkov
 */
'use strict'

import { startMainloop } from '../node_modules/natlib/scheduling/mainloop.js'
import { con, Settings } from './setup.js'

function update() {
}

function render() {
    con.fillStyle = '#1a1c2c'
    con.fillRect(0, 0, Settings.SCREEN_WIDTH, Settings.SCREEN_HEIGHT)
}

startMainloop(update, render)
