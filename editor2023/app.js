'use strict'

import { decodeBitmapBigInt } from './node_modules/natlib/bitmap/bitmap.js'
import { CanvasHandle } from './node_modules/natlib/canvas/CanvasHandle.js'
import { Pointer } from './node_modules/natlib/controls/Pointer.js'
import { startMainloop } from './node_modules/natlib/scheduling/mainloop.js'

// Board

const widthInput = document.querySelector('#width')
const heightInput = document.querySelector('#height')

let board = Array.from({ length: heightInput.value },
    () => Array.from({ length: widthInput.value }, () => 0))

function resizeBoard() {
    const resizedBoard = Array.from({ length: heightInput.value },
        () => Array.from({ length: widthInput.value }, () => 0))

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

// Color palette

const palette = {
    0: '#1a1c2c',
    1: '#ffcd75',
    2: '#94b0c2',
    3: '#a7f070',
    '#1a1c2c': 0,
    '#ffcd75': 1,
    '#94b0c2': 2,
    '#a7f070': 3,
}

const cardinality = BigInt(Object.keys(palette).filter(a => a.length === 1).length)

let colorIndex = 1

addEventListener('click', event => {
    const changeColor = event.target.dataset?.color ?? event.target.getAttribute('fill')
    if (changeColor) colorIndex = palette[changeColor]
})

// Code

const codeInput = document.querySelector('#code')

function encodeBoard() {
    let bigint = 0n

    for (let y = board.length - 1; y >= 0; --y) {
        for (let x = board[y].length - 1; x >= 0; --x) {
            bigint *= cardinality
            bigint += BigInt(board[y][x])
        }
    }

    codeInput.value = `${board[0].length.toString(16)}.${board.length.toString(16)}.${bigint.toString(16)}`
}

function decodeBoard() {
    try {
        const parts = codeInput.value.split('.')
        if (parts.length !== 3) {
            console.error('Invalid code')
            return
        }
        const width = parseInt(parts[0], 16)
        const height = parseInt(parts[1], 16)
        const bigint = BigInt(`0x${parts[2]}`)

        widthInput.value = width
        heightInput.value = height

        board = Array.from({ length: height },
            () => Array.from({ length: width }, () => 0))

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

    con.fillStyle = palette[0]
    con.fillRect(boardLeft, boardTop, width * cellSize, height * cellSize)

    // Grid
    con.beginPath()
    const size = Math.max(width, height)
    for (let n = 1; n < size; ++n) {
        if (n < width) {
            con.moveTo(boardLeft + n * cellSize, boardTop)
            con.lineTo(boardLeft + n * cellSize, boardTop + height * cellSize)
        }

        if (n < height) {
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
            if (index === 0) continue
            con.fillStyle = palette[index]
            con.fillRect(boardLeft + x * cellSize, boardTop + y * cellSize, cellSize, cellSize)
        }
    }

    // Pointer
    const x = Math.floor((pointer.x - boardLeft) / cellSize)
    const y = Math.floor((pointer.y - boardTop) / cellSize)

    con.beginPath()
    con.rect(boardLeft + x * cellSize, boardTop + y * cellSize, cellSize, cellSize)
    con.strokeStyle = '#73eff7'
    con.stroke()
}

startMainloop(update, render)
