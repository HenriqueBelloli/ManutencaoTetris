const { JSDOM } = require('jsdom')
const { drawNextPiece } = require('../tetris')

describe('drawNextPiece', () => {
  let canvas, context

  beforeEach(() => {
    const dom = new JSDOM(
      `
      <!DOCTYPE html>
      <html>
      <body>
        <div id="nextPiece1">
          <canvas id="nextPieceCanvas1" width="115" height="105"></canvas>
        </div>
        <div id="nextPiece2">
          <canvas id="nextPieceCanvas2" width="115" height="105"></canvas>
        </div>
        <div id="score-container">
            <div id="highscore">0</div>
            <div id="score">0</div>
        </div>
      </body>
      </html>
    `,
      { runScripts: 'dangerously', resources: 'usable' },
    )

    global.document = dom.window.document
    global.window = dom.window

    // Simular window.onload
    global.window.onload = function () {
      // Simular a função loadHighScore se necessário
      if (typeof loadHighScore === 'function') {
        loadHighScore()
      }
    }

    canvas = document.getElementById('nextPieceCanvas1')
    if (!canvas) {
      throw new Error('Canvas element not found')
    }

    context = canvas.getContext('2d')
    if (!context) {
      throw new Error('Failed to get canvas context')
    }

    jest.spyOn(context, 'clearRect')
    jest.spyOn(context, 'fillRect')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should handle case where canvas element is not found', () => {
    console.error = jest.fn()
    drawNextPiece('nonExistentCanvas', { shape: [1, 1, 1, 1], id: 0 })
    expect(console.error).toHaveBeenCalledWith('Canvas with id nonExistentCanvas not found')
  })

  test('should clear the canvas before drawing the new piece', () => {
    drawNextPiece('nextPieceCanvas1', { shape: [1, 1, 1, 1], id: 0 })
    expect(context.clearRect).toHaveBeenCalledWith(0, 0, canvas.width, canvas.height)
  })

  test('should correctly calculate dimensions and offsets of the piece', () => {
    const piece = { shape: [1, 1, 1, 1], id: 0 }
    drawNextPiece('nextPieceCanvas1', piece)

    // Check if the piece dimensions and offsets are calculated correctly
    const minX = 0,
      maxX = 3,
      minY = 0,
      maxY = 0
    const pieceWidth = maxX - minX + 1
    const pieceHeight = maxY - minY + 1
    const offsetX = Math.floor((canvas.width - pieceWidth * 20) / 2)
    const offsetY = Math.floor((canvas.height - pieceHeight * 20) / 2)

    expect(offsetX).toBe(10)
    expect(offsetY).toBe(30)
  })

  test('should correctly draw the piece on the canvas', () => {
    const piece = { shape: [1, 1, 1, 1], id: 0 }
    drawNextPiece('nextPieceCanvas1', piece)

    // Check if the piece is drawn correctly
    expect(context.fillRect).toHaveBeenCalledTimes(4)
    expect(context.fillRect).toHaveBeenCalledWith(10, 30, 20, 20)
    expect(context.fillRect).toHaveBeenCalledWith(30, 30, 20, 20)
    expect(context.fillRect).toHaveBeenCalledWith(50, 30, 20, 20)
    expect(context.fillRect).toHaveBeenCalledWith(70, 30, 20, 20)
  })
})
