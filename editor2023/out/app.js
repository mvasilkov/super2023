/** This file is part of Super Castle Game.
 * https://github.com/mvasilkov/super2023
 * @license GPLv3 | Copyright (c) 2023 Mark Vasilkov
 */
'use strict'

import { decodeBitmapBigInt } from '../node_modules/natlib/bitmap/bitmap.js'
import { CanvasHandle } from '../node_modules/natlib/canvas/CanvasHandle.js'
import { Pointer } from '../node_modules/natlib/controls/Pointer.js'
import { startMainloop } from '../node_modules/natlib/scheduling/mainloop.js'

// Settings

const GAME_URL = 'https://js13kgames.com/games/super-castle-game/index.html'

// Board

const PIECE_VOID = 0
const PIECE_BOARD = 1
const PIECE_DUCK = 2
const PIECE_DUCKLING = 3
const PIECE_GOAL = 4
const PIECE_BOX = 5
const PIECE_CUTTER = 6

const widthInput = document.querySelector('#width')
const heightInput = document.querySelector('#height')

let board = Array.from({ length: heightInput.value },
    () => Array.from({ length: widthInput.value }, () => PIECE_BOARD))

function resizeBoard() {
    const resizedBoard = Array.from({ length: heightInput.value },
        () => Array.from({ length: widthInput.value }, () => PIECE_BOARD))

    const height = Math.min(board.length, resizedBoard.length)
    const width = Math.min(board[0].length, resizedBoard[0].length)

    for (let y = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x) {
            resizedBoard[y][x] = board[y][x]
        }
    }

    board = resizedBoard

    encodeBoard()
}

widthInput.addEventListener('change', resizeBoard)
heightInput.addEventListener('change', resizeBoard)

// Palette

const palette = {
    [PIECE_VOID]: '#29366f',
    [PIECE_BOARD]: '#1a1c2c',
    [PIECE_DUCK]: '#ffcd75',
    [PIECE_DUCKLING]: '#94b0c2',
    [PIECE_GOAL]: '#a7f070',
    [PIECE_BOX]: '#41a6f6',
    [PIECE_CUTTER]: '#b13e53',
    '#29366f': PIECE_VOID,
    '#1a1c2c': PIECE_BOARD,
    '#ffcd75': PIECE_DUCK,
    '#94b0c2': PIECE_DUCKLING,
    '#a7f070': PIECE_GOAL,
    '#41a6f6': PIECE_BOX,
    '#b13e53': PIECE_CUTTER,
}

const cardinality = BigInt(Object.keys(palette).filter(a => a.length === 1).length)

let colorIndex = 1

addEventListener('click', event => {
    const changeColor = event.target.dataset?.color ?? event.target.getAttribute('fill')
    if (changeColor) colorIndex = palette[changeColor]
})

// Level code

const codeInput = document.querySelector('#code')
const playLink = document.querySelector('#play')

function encodeBoard() {
    let bigint = 0n

    for (let y = board.length - 1; y >= 0; --y) {
        for (let x = board[y].length - 1; x >= 0; --x) {
            bigint *= cardinality
            bigint += BigInt(board[y][x])
        }
    }

    codeInput.value = board[0].length.toString(16).padStart(2, '0') +
        board.length.toString(16).padStart(2, '0') + bigint.toString(16)
    playLink.href = GAME_URL + '#' + codeInput.value
}

function decodeBoard() {
    const string = codeInput.value
    try {
        // Nil level is 01010
        if (string.length < 5) {
            console.error('Invalid code')
            return
        }
        const width = parseInt(string.slice(0, 2), 16)
        const height = parseInt(string.slice(2, 4), 16)
        const bigint = BigInt('0x' + string.slice(4))

        widthInput.value = width
        heightInput.value = height

        board = Array.from({ length: height },
            () => Array.from({ length: width }, () => PIECE_BOARD))

        decodeBitmapBigInt(bigint, width, height, cardinality, (x, y, value) => {
            board[y][x] = value
        })
    }
    catch (err) {
        console.error(err)
        return
    }
}

encodeBoard()

codeInput.addEventListener('input', () => decodeBoard())

// Setup

const SCREEN_WIDTH = 960
const SCREEN_HEIGHT = 540 // 16:9

const canvas = new CanvasHandle(document.querySelector('#c'), SCREEN_WIDTH, SCREEN_HEIGHT)
const { con } = canvas
con.lineWidth = 1.5

const pointer = new Pointer(canvas.canvas)
pointer.addEventListeners(canvas.canvas)

function update() {
    if (pointer.held) {
        const height = board.length
        const width = board[0].length

        const cellSize = Math.min(SCREEN_WIDTH / width, SCREEN_HEIGHT / height)
        const boardLeft = 0.5 * (SCREEN_WIDTH - width * cellSize)
        const boardTop = 0.5 * (SCREEN_HEIGHT - height * cellSize)

        const x = Math.floor((pointer.x - boardLeft) / cellSize)
        const y = Math.floor((pointer.y - boardTop) / cellSize)

        if (x >= 0 && x < width && y >= 0 && y < height) {
            board[y][x] = colorIndex

            encodeBoard()
        }
    }
}

function render() {
    con.fillStyle = '#000'
    con.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT)

    const height = board.length
    const width = board[0].length

    const cellSize = Math.min(SCREEN_WIDTH / width, SCREEN_HEIGHT / height)
    const boardLeft = 0.5 * (SCREEN_WIDTH - width * cellSize)
    const boardTop = 0.5 * (SCREEN_HEIGHT - height * cellSize)

    con.fillStyle = palette[PIECE_BOARD]
    con.fillRect(boardLeft, boardTop, width * cellSize, height * cellSize)

    // Grid
    con.beginPath()
    const size = Math.max(width, height)
    for (let n = 0; n <= size; ++n) {
        if (n <= width) {
            con.moveTo(boardLeft + n * cellSize, boardTop)
            con.lineTo(boardLeft + n * cellSize, boardTop + height * cellSize)
        }

        if (n <= height) {
            con.moveTo(boardLeft, boardTop + n * cellSize)
            con.lineTo(boardLeft + width * cellSize, boardTop + n * cellSize)
        }
    }
    con.strokeStyle = '#333c57'
    con.stroke()

    // Cells
    for (let y = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x) {
            const index = board[y][x]
            if (index === PIECE_BOARD) continue
            con.fillStyle = palette[index]
            con.fillRect(boardLeft + x * cellSize, boardTop + y * cellSize, cellSize, cellSize)
        }
    }

    // Pointer
    const x = Math.floor((pointer.x - boardLeft) / cellSize)
    const y = Math.floor((pointer.y - boardTop) / cellSize)

    if (x < 0 || y < 0 || x >= width || y >= height)
        return

    con.beginPath()
    con.rect(boardLeft + x * cellSize, boardTop + y * cellSize, cellSize, cellSize)
    con.strokeStyle = '#73eff7'
    con.stroke()
}

startMainloop(update, render)
