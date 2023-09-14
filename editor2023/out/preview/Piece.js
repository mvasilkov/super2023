/** This file is part of Super Castle Game.
 * https://github.com/mvasilkov/super2023
 * @license GPLv3 | Copyright (c) 2023 Mark Vasilkov
 */
'use strict';

import { Vec2 } from '../../node_modules/natlib/Vec2.js';
export class Piece extends Vec2 {
  constructor(type, x, y) {
    super(x, y);
    this.type = type;
    this.oldPosition = new Vec2(x, y);
  }
}
export class Cluster {
  constructor(pieces) {
    (this.pieces = pieces).forEach(p => p.cluster = this);
  }
}
