'use strict'

import { CanvasHandle } from './node_modules/natlib/canvas/CanvasHandle.js'
import { Pointer } from './node_modules/natlib/controls/Pointer.js'
import { startMainloop } from './node_modules/natlib/scheduling/mainloop.js'

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
}

widthInput.addEventListener('change', resizeBoard)
heightInput.addEventListener('change', resizeBoard)

const SCREEN_WIDTH = 960
const SCREEN_HEIGHT = 540 // 16:9

const canvas = new CanvasHandle(document.querySelector('#c'), SCREEN_WIDTH, SCREEN_HEIGHT)
const { con } = canvas
con.lineWidth = 1.5

const pointer = new Pointer(canvas.canvas)
pointer.addEventListeners(canvas.canvas)

function update() {
}

function render() {
    con.fillStyle = '#000'
    con.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT)

    const height = board.length
    const width = board[0].length

    const cellSize = Math.min(SCREEN_WIDTH / width, SCREEN_HEIGHT / height)
    const boardLeft = 0.5 * (SCREEN_WIDTH - width * cellSize)
    const boardTop = 0.5 * (SCREEN_HEIGHT - height * cellSize)

    con.fillStyle = '#1a1c2c'
    con.fillRect(boardLeft, boardTop, width * cellSize, height * cellSize)

    // Paint the grid
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
}

startMainloop(update, render)
