/** This file is part of Super Castle Game.
 * https://github.com/mvasilkov/super2023
 * @license GPLv3 | Copyright (c) 2023 Mark Vasilkov
 */
'use strict';

import { CanvasHandle } from '../../node_modules/natlib/canvas/CanvasHandle.js';
// Output
export const canvas = new CanvasHandle(document.querySelector('#p'), 500, 500);
export const con = canvas.con;
con.lineWidth = 1.5;
// Helper functions
export function oscillate(t) {
  return t < 0.5 ? 2 * t : 2 - 2 * t;
}
export function wrapAround(t) {
  return t - Math.floor(t);
}
