/** This file is part of Super Castle Game.
 * https://github.com/mvasilkov/super2023
 * @license GPLv3 | Copyright (c) 2023 Mark Vasilkov
 */
'use strict';

import { decodeBitmapBigInt } from '../../node_modules/natlib/bitmap/bitmap.js';
import { Cluster, Piece } from './Piece.js';
export class Board {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.pieces = {};
    this.positions = Array.from({
      length: height
    }, () => Array.from({
      length: width
    }, () => []));
  }
  createPiece(type, x, y) {
    const piece = new Piece(type, x, y);
    (this.pieces[type] ??= []).push(piece);
    this.positions[y][x].push(piece);
    return piece;
  }
  discardPiece(piece) {
    let stack = this.pieces[piece.type];
    stack.splice(stack.indexOf(piece), 1);
    stack = this.positions[piece.y][piece.x];
    stack.splice(stack.indexOf(piece), 1);
  }
  /** Move a piece to a position on the board. */
  putPiece(piece, x, y) {
    const stack = this.positions[piece.y][piece.x];
    stack.splice(stack.indexOf(piece), 1);
    this.positions[y][x].push(piece.set(x, y));
  }
  getBorderingPieces(piece, type) {
    return this.pieces[type]?.filter(p => p.distanceSquared(piece) === 1);
  }
  /*
  hasBorderingPieces(piece: Readonly<Piece>, type: PieceType): boolean | undefined {
      return this.pieces[type]?.some(p => p.distanceSquared(piece) === 1)
  }
  */
  /** Get a group of adjacent pieces of identical type. */
  getGroup(piece) {
    const group = new Set([piece]);
    const stack = [piece];
    while (stack.length) {
      const piece = stack.pop();
      this.getBorderingPieces(piece, piece.type).forEach(other => {
        if (group.has(other)) return;
        group.add(other);
        stack.push(other);
      });
    }
    return group;
  }
  buildClusters(type) {
    const pieces = new Set(this.pieces[type]);
    for (const piece of pieces) {
      const cluster = new Cluster([...this.getGroup(piece)]);
      cluster.pieces.forEach(p => pieces.delete(p));
    }
  }
  load(value) {
    decodeBitmapBigInt(value, this.width, this.height, 7 /* Settings.LEVEL_CARDINALITY */, (x, y, type) => {
      if (type === 1) return;
      if (type !== 0) --type;
      this.createPiece(type, x, y);
    });
  }
}
