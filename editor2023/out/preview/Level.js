/** This file is part of Super Castle Game.
 * https://github.com/mvasilkov/super2023
 * @license GPLv3 | Copyright (c) 2023 Mark Vasilkov
 */
'use strict';

import { easeInOutQuad, easeOutQuad, lerp } from '../../node_modules/natlib/interpolation.js';
import { Board } from './Board.js';
import { Vec2 } from '../../node_modules/natlib/Vec2.js';
import { con, oscillate, wrapAround } from './setup.js';
export class Level {
  constructor(width, height) {
    this.board = new Board(width, height);
    /*@__MANGLE_PROP__*/
    this.ducksOnGoal = new Set();
    /*@__MANGLE_PROP__*/
    this.ducksOnGoalNext = new Set();
    this.cellSize = Math.min(500 / width, 500 / height);
    this.boardLeft = 0.5 * (500 - width * this.cellSize);
    this.boardTop = 0.5 * (500 - height * this.cellSize);
  }
  render(t, tOscillator) {
    const tDuck = 0;
    const duckColors = ["#ffcd75"];
    const duckSecondaryColors = ["#ef7d57"];
    con.clearRect(0, 0, 500, 500);
    con.fillStyle = "#1a1c2c" /* Palette.BOARD */;
    con.fillRect(this.boardLeft, this.boardTop, this.board.width * this.cellSize, this.board.height * this.cellSize);
    // Grid
    con.beginPath();
    const size = Math.max(this.board.width, this.board.height);
    for (let n = 1; n < size; ++n) {
      if (n < this.board.width) {
        con.moveTo(this.boardLeft + n * this.cellSize, this.boardTop);
        con.lineTo(this.boardLeft + n * this.cellSize, this.boardTop + this.board.height * this.cellSize);
      }
      if (n < this.board.height) {
        con.moveTo(this.boardLeft, this.boardTop + n * this.cellSize);
        con.lineTo(this.boardLeft + this.board.width * this.cellSize, this.boardTop + n * this.cellSize);
      }
    }
    con.strokeStyle = "#333c57" /* Palette.GRID */;
    con.stroke();
    // Outline
    if (this.outline) {
      con.strokeStyle = "#41a6f6" /* Palette.OUTLINE */;
      con.stroke(this.outline);
    }
    // Floor tiles
    this.board.pieces[3 /* PieceType.GOAL */]?.forEach(piece => this.renderPiece(piece, piece.x, piece.y, tDuck, 0, duckColors, duckSecondaryColors));
    // Blocks
    for (let y = 0; y < this.board.height; ++y) {
      for (let x = 0; x < this.board.width; ++x) {
        const tVibe = wrapAround(tOscillator + 0.1 /* Settings.OSCILLATOR_INCREMENT */ * (x - 0.85 * y));
        this.board.positions[y][x].forEach(piece => piece.type !== 3 /* PieceType.GOAL */ && this.renderPiece(piece, x, y, tDuck, tVibe, duckColors, duckSecondaryColors));
      }
    }
  }
  renderPiece(piece, x, y, tDuck, tVibe, duckColors, duckSecondaryColors) {
    let size = this.cellSize;
    x = x * size + this.boardLeft;
    y = y * size + this.boardTop;
    if (piece.type === 0 /* PieceType.VOID */) {
      con.fillStyle = "#000" /* Palette.NOTHING */;
      con.fillRect(x, y, size, size);
      y += (0.1 * easeInOutQuad(oscillate(tVibe)) - 0.05) * size;
      con.beginPath();
      con.moveTo(x + 0.2 * size, y + 0.2 * size);
      con.lineTo(x + 0.8 * size, y + 0.8 * size);
      con.moveTo(x + 0.2 * size, y + 0.8 * size);
      con.lineTo(x + 0.8 * size, y + 0.2 * size);
      con.strokeStyle = "#566c86" /* Palette.VOID */;
      con.stroke();
      return;
    }
    if (piece.type === 3 /* PieceType.GOAL */) {
      const step = size / 3 /* Settings.HATCHING_AMOUNT */;
      con.beginPath();
      for (let n = 0; n < 3 /* Settings.HATCHING_AMOUNT */; ++n) {
        const sn = step * (n + 0.5);
        con.moveTo(x, y + sn);
        con.lineTo(x + sn, y);
        con.moveTo(x + size, y + size - sn);
        con.lineTo(x + size - sn, y + size);
      }
      con.strokeStyle = "#a7f070" /* Palette.GOAL */;
      con.stroke();
      return;
    }
    x -= 0.25 /* Settings.BLOCK_GROW */;
    y -= 0.25 /* Settings.BLOCK_GROW */;
    size += 2 * 0.25 /* Settings.BLOCK_GROW */;
    if (piece.killed) {
      const padding = 0.5 * (this.cellSize - (size = lerp(size, 0, tDuck)));
      x += padding;
      y += padding;
    }
    const bh = 0.4 /* Settings.BLOCK_HEIGHT */ * size;
    switch (piece.type) {
      case 1 /* PieceType.DUCK */:
        const colorIndex = (this.ducksOnGoal.has(piece) ? 1 : 0) + (this.ducksOnGoalNext.has(piece) ? 2 : 0);
        paintBlock(x, y, size, bh, duckColors[colorIndex], duckSecondaryColors[colorIndex], 0, 20 /* Settings.BLOCK_REFLECTION_OPACITY */);
        if (colorIndex === 3) {
          con.beginPath();
          con.moveTo(x + 0.2 * size, y - bh + 0.5 * size);
          con.lineTo(x + 0.4 * size, y - bh + 0.7 * size);
          con.lineTo(x + 0.8 * size, y - bh + 0.3 * size);
          con.strokeStyle = "#38b764" /* Palette.DUCK_ON_GOAL_2 */;
          con.stroke();
        } else if (colorIndex === 0 && this.ducksOnGoal.size && this.ducksOnGoalNext.size) {
          con.beginPath();
          con.moveTo(x + 0.2 * size, y - bh + 0.2 * size);
          con.lineTo(x + 0.8 * size, y - bh + 0.8 * size);
          con.moveTo(x + 0.2 * size, y - bh + 0.8 * size);
          con.lineTo(x + 0.8 * size, y - bh + 0.2 * size);
          con.strokeStyle = "#ef7d57" /* Palette.DUCK_2 */;
          con.stroke();
        }
        break;
      case 2 /* PieceType.DUCKLING */:
        paintBlock(x, y, size, bh, "#94b0c2" /* Palette.DUCKLING */, "#566c86" /* Palette.DUCKLING_2 */, 0, 20 /* Settings.BLOCK_REFLECTION_OPACITY */);
        break;
      case 4 /* PieceType.BOX */:
        paintBlock(x, y, size, bh, "#41a6f6" /* Palette.BOX */, "#3b5dc9" /* Palette.BOX_2 */, 0, 20 /* Settings.BLOCK_REFLECTION_OPACITY */);
        con.beginPath();
        con.arc(x + 0.5 * size, y - bh + 0.5 * size, 0.3 * size, 0, 2 * Math.PI);
        con.strokeStyle = "#3b5dc9" /* Palette.BOX_2 */;
        con.stroke();
        break;
      case 5 /* PieceType.CUTTER */:
        const height = (0.9 * easeOutQuad(oscillate(tVibe)) + 0.1) * bh;
        con.beginPath();
        con.lineTo(x + 0.8 * size, y + 0.5 * size);
        con.arc(x + 0.5 * size, y + height + 0.5 * size, 0.3 * size, 0, Math.PI);
        con.lineTo(x + 0.2 * size, y + 0.5 * size);
        con.fillStyle = "#c42430" /* Palette.CUTTER_2 */ + 20 /* Settings.BLOCK_REFLECTION_OPACITY */;
        con.fill();
        con.beginPath();
        con.lineTo(x + 0.8 * size, y - height + 0.5 * size);
        con.arc(x + 0.5 * size, y + 0.5 * size, 0.3 * size, 0, Math.PI);
        con.lineTo(x + 0.2 * size, y - height + 0.5 * size);
        con.fillStyle = "#c42430" /* Palette.CUTTER_2 */;
        con.fill();
        con.beginPath();
        con.arc(x + 0.5 * size, y - height + 0.5 * size, 0.3 * size, 0, 2 * Math.PI);
        con.fillStyle = "#f5555d" /* Palette.CUTTER */;
        con.fill();
    }
  }
}
function paintBlock(x, y, size, height, color, color2, progress, reflectionOpacity) {
  if (reflectionOpacity) {
    con.fillStyle = color2 + reflectionOpacity;
    con.fillRect(x, y + size - 0.25 /* Settings.BLOCK_GROW */, size, height + 0.25 /* Settings.BLOCK_GROW */);
  }

  con.fillStyle = color2;
  con.fillRect(x + progress, y - height + size - 0.25 /* Settings.BLOCK_GROW */, size - progress, height + 0.25 /* Settings.BLOCK_GROW */);
  con.fillStyle = color;
  con.fillRect(x + progress, y - height, size - progress, size);
}
export function loadLevel(string) {
  const width = parseInt(string.slice(0, 2), 16);
  const height = parseInt(string.slice(2, 4), 16);
  const bigint = BigInt('0x' + string.slice(4));
  const level = new Level(width, height);
  level.board.load(bigint);
  const clusterTypes = [1 /* PieceType.DUCK */, 2 /* PieceType.DUCKLING */, 4 /* PieceType.BOX */];
  clusterTypes.forEach(type => level.board.buildClusters(type));
  try {
    level.outline = outline(level);
  } catch (err) {}
  return level;
}
//#region Level outline
class Edge {
  constructor(x0, y0, x1, y1) {
    this.start = new Vec2(x0, y0);
    this.end = new Vec2(x1, y1);
    this.dir = new Vec2(x1 - x0, y1 - y0);
    this.next = null;
  }
}
function outline({
  board,
  cellSize,
  boardLeft,
  boardTop
}) {
  const ch = Array.from({
    length: board.height + 1
  }, (_, y) => Array.from({
    length: board.width + 1
  }, (_, x) => ({
    edges: [],
    value: board.positions[y]?.[x]?.every(p => p.type !== 0 /* PieceType.VOID */)
  })));

  const edges = new Set();
  const edgesAfterNext = new Set(); // Edges pointed to by next
  const path = new Path2D();
  // Debug
  // console.log(ch.map(row => row.map(col => col.value ? '#' : ' ').join('')).join('\n'))
  for (let y = 0; y < board.height; ++y) {
    for (let x = 0; x < board.width; ++x) {
      if (!ch[y][x].value) continue;
      const left = x > 0 && ch[y][x - 1].value ? null : new Edge(x, y + 1, x, y);
      const up = y > 0 && ch[y - 1][x].value ? null : new Edge(x, y, x + 1, y);
      const right = ch[y][x + 1].value ? null : new Edge(x + 1, y, x + 1, y + 1);
      const down = ch[y + 1][x].value ? null : new Edge(x + 1, y + 1, x, y + 1);
      if (left && up) {
        left.next = up;
        edgesAfterNext.add(up);
      }
      if (up && right) {
        up.next = right;
        edgesAfterNext.add(right);
      }
      if (right && down) {
        right.next = down;
        edgesAfterNext.add(down);
      }
      if (down && left) {
        down.next = left;
        edgesAfterNext.add(left);
      }
      if (left) {
        ch[left.start.y][left.start.x].edges.push(left);
        edges.add(left);
      }
      if (up) {
        ch[up.start.y][up.start.x].edges.push(up);
        edges.add(up);
      }
      if (right) {
        ch[right.start.y][right.start.x].edges.push(right);
        edges.add(right);
      }
      if (down) {
        ch[down.start.y][down.start.x].edges.push(down);
        edges.add(down);
      }
    }
  }
  function findSubpath(edge) {
    const endPoint = edge.start; // If we've reached this, we're done with the subpath
    path.moveTo(edge.start.x * cellSize + boardLeft, edge.start.y * cellSize + boardTop);
    // console.log('Subpath:')
    while (1 /* ShortBool.TRUE */) {
      // Take this edge
      edges.delete(edge);
      edgesAfterNext.delete(edge);
      const arr = ch[edge.start.y][edge.start.x].edges;
      arr.splice(arr.indexOf(edge), 1);
      // Chain
      while (!edge.next && ch[edge.end.y][edge.end.x].edges.length === 1) {
        const chain = ch[edge.end.y][edge.end.x].edges[0];
        if (chain.dir.x !== edge.dir.x || chain.dir.y !== edge.dir.y) break;
        edge.end.copy(chain.end);
        edge.next = chain.next;
        // Clean up
        edges.delete(chain);
        edgesAfterNext.delete(chain);
        const arr = ch[chain.start.y][chain.start.x].edges;
        arr.splice(arr.indexOf(chain), 1);
      }
      // Save and continue on the path
      if (edge.end.x === endPoint.x && edge.end.y === endPoint.y) {
        // console.log('Close subpath')
        path.closePath();
        break;
      } else {
        // console.log(`(${edge.start.x}, ${edge.start.y}) to (${edge.end.x}, ${edge.end.y})`)
        path.lineTo(edge.end.x * cellSize + boardLeft, edge.end.y * cellSize + boardTop);
      }
      if (edge.next) edge = edge.next;else if (ch[edge.end.y][edge.end.x].edges.length === 1) edge = ch[edge.end.y][edge.end.x].edges[0];else throw Error('Logic error');
    }
  }
  for (let edge of edgesAfterNext) {
    findSubpath(edge);
  }
  for (const edge of edges) {
    // console.log(`Leftover (${edge.start.x}, ${edge.start.y}) to (${edge.end.x}, ${edge.end.y})`)
    findSubpath(edge);
  }
  return path;
}
