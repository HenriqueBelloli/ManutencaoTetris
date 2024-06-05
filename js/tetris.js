var COLS = 10, ROWS = 20;
var board = [];
var lose;
var interval;
var intervalRender;
var current; // current moving shape
var currentX, currentY; // position of current shape
var freezed; // is current shape settled on the board?
var nextPiece; // Variavel para gerar a proxima 
var shapes = [
    [ 1, 1, 1, 1 ],
    [ 1, 1, 1, 0,
      1 ],
    [ 1, 1, 1, 0,
      0, 0, 1 ],
    [ 1, 1, 0, 0,
      1, 1 ],
    [ 1, 1, 0, 0,
      0, 1, 1 ],
    [ 0, 1, 1, 0,
      1, 1 ],
    [ 0, 1, 0, 0,
      1, 1, 1 ]
];
var colors = [
    'cyan', 'orange', 'blue', 'yellow', 'red', 'green', 'purple'
];

// Função para gerar uma peça aleatória
function generateRandomPiece() {
    var id = Math.floor( Math.random() * shapes.length );
    var shape = shapes[ id ];
    return { shape: shape, id: id };
}

// creates a new 4x4 shape in global variable 'current'
// 4x4 so as to cover the size when the shape is rotated
function newShape() {
    if (!nextPiece) {
        nextPiece = generateRandomPiece();
    }
    var id = nextPiece.id;
    var shape = nextPiece.shape;

    current = [];
    for ( var y = 0; y < 4; ++y ) {
        current[ y ] = [];
        for ( var x = 0; x < 4; ++x ) {
            var i = 4 * y + x;
            if ( typeof shape[ i ] != 'undefined' && shape[ i ] ) {
                current[ y ][ x ] = id + 1;
            }
            else {
                current[ y ][ x ] = 0;
            }
        }
    }
    
    nextPiece = generateRandomPiece();
    drawNextPiece();

    // new shape starts to move
    freezed = false;
    // position where the shape will evolve
    currentX = 5;
    currentY = 0;
}

// Desenha a próxima peça no canvas nextPieceCanvas
function drawNextPiece() {
    const canvas = document.getElementById('nextPieceCanvas');
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    var shape = nextPiece.shape;
    var id = nextPiece.id;

    // Calcula a largura e altura da peça
    var minX = 4, maxX = 0, minY = 4, maxY = 0;
    for (var y = 0; y < 4; ++y) {
        for (var x = 0; x < 4; ++x) {
            var i = 4 * y + x;
            if (shape[i]) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }
    }

    var pieceWidth = maxX - minX + 1;
    var pieceHeight = maxY - minY + 1;

    // Calcula o offset para centralizar a peça
    var offsetX = Math.floor((canvas.width - pieceWidth * 20) / 2);
    var offsetY = Math.floor((canvas.height - pieceHeight * 20) / 2);

    context.fillStyle = colors[id];
    for (var y = 0; y < 4; ++y) {
        for (var x = 0; x < 4; ++x) {
            var i = 4 * y + x;
            if (shape[i]) {
                context.fillRect(offsetX + (x - minX) * 20, offsetY + (y - minY) * 20, 20, 20);
            }
        }
    }
}

// clears the board
function init() {
    for ( var y = 0; y < ROWS; ++y ) {
        board[ y ] = [];
        for ( var x = 0; x < COLS; ++x ) {
            board[ y ][ x ] = 0;
        }
    }
}

// keep the element moving down, creating new shapes and clearing lines
function tick() {
    if ( valid( 0, 1 ) ) {
        ++currentY;
    }
    // if the element settled
    else {
        freeze();
        valid(0, 1);
        clearLines();
        if (lose) {
            clearAllIntervals();
            return false;
        }
        newShape();
    }
}

// stop shape at its position and fix it to board
function freeze() {
    for ( var y = 0; y < 4; ++y ) {
        for ( var x = 0; x < 4; ++x ) {
            if ( current[ y ][ x ] ) {
                board[ y + currentY ][ x + currentX ] = current[ y ][ x ];
            }
        }
    }
    freezed = true;
}

// returns rotates the rotated shape 'current' perpendicularly anticlockwise
function rotate( current ) {
    var newCurrent = [];
    for ( var y = 0; y < 4; ++y ) {
        newCurrent[ y ] = [];
        for ( var x = 0; x < 4; ++x ) {
            newCurrent[ y ][ x ] = current[ 3 - x ][ y ];
        }
    }

    return newCurrent;
}

// Verofoca se a linha será limpa
function clearLines() {
    for (var y = ROWS - 1; y >= 0; --y) {
        if (isRowFilled(y)) {
            clearAndMoveLines(y);
        }
    }
}

// Verifica se a linha está preenchida
function isRowFilled(y) {
    for (var x = 0; x < COLS; ++x) {
        if (board[y][x] == 0) {
            return false;
        }
    }
    return true;
}

// Limpa a linha e move as linhas acima para baixo
function clearAndMoveLines(y) {
    document.getElementById('clearsound').play();
    for (var yy = y; yy > 0; --yy) {
        for (var x = 0; x < COLS; ++x) {
            board[yy][x] = board[yy - 1][x];
        }
    }
    for (var x = 0; x < COLS; ++x) {
        board[0][x] = 0;
    }
}

function moveLeft() {
    if (valid(-1)) {
        --currentX;
    }
}

function moveDown() {
    if (valid(0, 1)) {
        ++currentY;
    }
}

function keyPress(key) {
    switch (key) {
        case 'left':
            moveLeft();
            break;
        case 'right':
            if (valid(1)) {
                ++currentX;
            }
            break;
        case 'down':
            moveDown();
            break;
        case 'rotate':
            var rotated = rotate(current);
            if (valid(0, 0, rotated)) {
                current = rotated;
            }
            break;
        case 'drop':
            while (valid(0, 1)) {
                ++currentY;
            }
            tick();
            break;
    }
}


// checks if the resulting position of current shape will be feasible
function valid( offsetX, offsetY, newCurrent ) {
    offsetX = offsetX || 0;
    offsetY = offsetY || 0;
    offsetX = currentX + offsetX;
    offsetY = currentY + offsetY;
    newCurrent = newCurrent || current;

    for ( var y = 0; y < 4; ++y ) {
        for ( var x = 0; x < 4; ++x ) {
            if ( newCurrent[ y ][ x ] ) {
                if ( typeof board[ y + offsetY ] == 'undefined'
                  || typeof board[ y + offsetY ][ x + offsetX ] == 'undefined'
                  || board[ y + offsetY ][ x + offsetX ]
                  || x + offsetX < 0
                  || y + offsetY >= ROWS
                  || x + offsetX >= COLS ) {
                    if (offsetY == 1 && freezed) {
                        lose = true; // lose if the current shape is settled at the top most row
                        document.getElementById('playbutton').disabled = false;
                    } 
                    return false;
                }
            }
        }
    }
    return true;
}

function playButtonClicked() {
    newGame();
    document.getElementById("playbutton").disabled = true;
}

function newGame() {
    clearAllIntervals();
    intervalRender = setInterval( render, 30 );
    init();
    newShape();
    lose = false;
    interval = setInterval( tick, 400 );
}

function clearAllIntervals(){
    clearInterval( interval );
    clearInterval( intervalRender );
}