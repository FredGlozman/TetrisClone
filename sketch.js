//tetris board background color
const bgColor = '#0E0E0E';
//background color of the right panel
const rightPanelBgColor = '#141414';
//color of all text in the game
const textColor = '#d9dce0';

//stroke width of sub-panels in the right panel
const rightPanelStrokeWidth = 5;
//stroke width for content other than right panel sub-panels
const tetrominoStrokeWidth = 2;

//width, height and spacing of the pause symbol
const pauseWidth = 15;
const pauseHeight = 50;
const spacing = 2;

//frame rate of the game (60fps)
const rate = 60;

//width and height of the tetris board in squares
//standard tetris board dimensions. 10 squares wide, 22 square heigh.
const x = 10; 
const y = 22; 

//height of the canvas
var height;

//width of the left and right panels. and the total width of the canvas
var boardWidth;
var rightPanelWidth;
var totalWidth; 

//up next sub-panel of the right panel coordinates and size specifications
//this sub-panel displays the tetromino that will be droped next
var upNextY;
var upNextX;
var upNextHeight;
var upNextWidth;

//stats sub-panel of the right panel coordinates and size specifications
//this sub-panel contains thet stats of the current gameplay (level, score, total lines cleared)
var statsY;
var statsX;
var statsHeight;
var statsWidth;

//info sub-panel of the right panel coordinates and size specifications
//contains the pause/help button
var infoY;
var infoX;
var infoHeight; 
var infoWidth;

//size of a single square on the tetris board
var unitSize; 

//reference to the game logic
var logic; 

//tetromino falling in the welcome screen
var welcomeFallingTetromino;

//true when in the welcome screen, false otherwise
var welcome;
//true when the game is interupted for reasons other than toggling pause, false otherwise
var error;
//true when the game is paused, false otherwise
var paused;

//true when the error screen has been drawn on screen, flase otherwise
var errorDrawn;

//true when the pause screen has been drawn on screen, flase otherwise
var pausedDrawn;


function setup() {
  welcomeFallingTetromino = null;

  //when the page is first loaded, user is greeted with the welcome view
  welcome = true;
  error = null;
  paused = false;

  errorDrawn = false;
  pausedDrawn = false;

  //left and right panel dimensions
  height = min(windowHeight, windowWidth);
  boardWidth = height/(y/x);
  totalWidth = boardWidth*1.5;
  rightPanelWidth = totalWidth - boardWidth;

  createCanvas(totalWidth, height);
  frameRate(rate);

  unitSize = boardWidth/x;

  var strokeWidthMargin = 2; 

  //up next sub-panel dimensions
  upNextY = 0 + strokeWidthMargin;
  upNextX = boardWidth + strokeWidthMargin;
  upNextWidth = rightPanelWidth - rightPanelStrokeWidth;
  upNextHeight = unitSize*4;

  //stats sub-panel dimensions
  statsY = upNextY + upNextHeight + unitSize/3;
  statsX = boardWidth + strokeWidthMargin;
  statsHeight = upNextHeight;
  statsWidth = rightPanelWidth - rightPanelStrokeWidth;

  //info sub-panel dimensions
  infoY = statsY + statsHeight + unitSize/3;
  infoX = boardWidth + strokeWidthMargin;
  infoHeight = height - infoY - rightPanelStrokeWidth + strokeWidthMargin;
  infoWidth = rightPanelWidth - rightPanelStrokeWidth;

  //initializing the game logic
  logic = new Logic(x,y); 
}

function draw() {
  if(welcome) {
    pausedDrawn = false;
    errorDrawn = false;

    drawWelcomeScreen();
  } else if(paused) {
    errorDrawn = false;

    if(!pausedDrawn) {
      drawPauseScreen();
      pausedDrawn = true;
    }
  } else if(error != null) {
    pausedDrawn=false;

    if(!errorDrawn) {
      drawErrorScreen(error);
      errorDrawn = true;
    }
  } else {
    pausedDrawn=false;
    errorDrawn = false;

    try {
      logic.updateBoard();
    } catch(e) {
      processError(e);
    }

    drawGameScreen();
  }
}

function drawGameScreen() {
  background(bgColor);
  drawRightPanel();
      
  drawBoard(logic.getMatrix(), unitSize, 0, 0);
  drawStats();
  drawInfo()
  drawNextTetrominoType();
}

function drawWelcomeScreen() {
  //will contain just the skeleton of the game screen since the game has not begun
  drawGameScreen()

  drawWelcomeFallingTetromino();

  blurBoard();

  var yShift = drawTetrisLogo(yShift);

  fill(textColor);
  strokeWeight(tetrominoStrokeWidth);
  textSize(30);
  textAlign(CENTER, CENTER);

  text("(click to start)", 0, yShift, boardWidth, 2*yShift);
}

function drawWelcomeFallingTetromino() {
  //no current falling tetromino, need to create a new one.
  if(welcomeFallingTetromino == null) {
    welcomeFallingTetromino = new Tetromino(logic.randomTetromino(), 0, 0, null, 0);
    welcomeFallingTetromino.setCurrentPosition(logic.getRandomTetrominoStartingX(welcomeFallingTetromino), 0);
  } 
  //there's already a tetromino currently being dropped that has no yet reached the bottom
  else if(welcomeFallingTetromino.getY() < y) {
    //so that the tetromino falls at a rate slower than the frame rate (otherwise it's too fast)
    if(frameCount % (rate/10) == 0) {
      welcomeFallingTetromino = welcomeFallingTetromino.getShiftedDown();
    }
  } 
  //the tetromino that was being dropped has reached the bottom
  else {
    welcomeFallingTetromino = null;
  }

  //draw the tetromino of the tetris board
  if(welcomeFallingTetromino != null) {
    var board = welcomeFallingTetromino.getAsBoard();

    //draw the tetromino on screen
    drawBoard(board, unitSize, welcomeFallingTetromino.getX()*unitSize, welcomeFallingTetromino.getY()*unitSize);
  }
}

function drawTetrisLogo(yShift) {
  //hardcoded tetris logo matrix
  var tetris = [[new Entry(true,'orange'), new Entry(true,'orange'),new Entry(true,'orange'), new Entry(false, null),new Entry(true,'blue'),new Entry(true,'blue'), new Entry(true,'blue'), new Entry(false, null), new Entry(true,'red'), new Entry(true,'red'),new Entry(true,'red'),  new Entry(false, null), new Entry(true,'green'), new Entry(true,'green'), new Entry(false,null), new Entry(false,null), new Entry(true,'purple'), new Entry(false,null), new Entry(false,null), new Entry(true,'cyan'), new Entry(true,'cyan')],
                [new Entry(false, null),new Entry(true,'orange'),new Entry(false, null),new Entry(false, null),new Entry(true,'blue'),new Entry(false, null),new Entry(false, null),new Entry(false, null), new Entry(false, null),new Entry(true,'red'),new Entry(false, null), new Entry(false, null), new Entry(true,'green'), new Entry(false, null),new Entry(true,'green'), new Entry(false,null), new Entry(true,'purple'), new Entry(false,null), new Entry(true,'cyan'), new Entry(false,null), new Entry(false,null)],
                [new Entry(false, null),new Entry(true,'orange'),new Entry(false, null),new Entry(false, null),new Entry(true,'blue'),new Entry(true,'blue'), new Entry(true,'blue'), new Entry(false, null), new Entry(false, null),new Entry(true,'red'),new Entry(false, null), new Entry(false, null), new Entry(true,'green'), new Entry(true,'green'), new Entry(false,null), new Entry(false,null), new Entry(true,'purple'), new Entry(false,null), new Entry(false,null), new Entry(true,'cyan'), new Entry(false,null)],
                [new Entry(false, null),new Entry(true,'orange'),new Entry(false, null),new Entry(false, null),new Entry(true,'blue'),new Entry(false, null),new Entry(false, null),new Entry(false, null), new Entry(false, null),new Entry(true,'red'),new Entry(false, null), new Entry(false, null), new Entry(true,'green'), new Entry(false, null),new Entry(true,'green'), new Entry(false,null), new Entry(true,'purple'), new Entry(false,null), new Entry(false,null), new Entry(false,null), new Entry(true,'cyan')],
                [new Entry(false, null),new Entry(true,'orange'),new Entry(false, null),new Entry(false, null),new Entry(true,'blue'),new Entry(true,'blue'), new Entry(true,'blue'), new Entry(false, null), new Entry(false, null),new Entry(true,'red'),new Entry(false, null), new Entry(false, null), new Entry(true,'green'), new Entry(false, null),new Entry(true,'green'), new Entry(false,null), new Entry(true,'purple'), new Entry(false,null), new Entry(true,'cyan'), new Entry(true,'cyan'), new Entry(false,null)]
                ];
  
  var size = boardWidth/tetris[0].length
  var yShift = statsY + statsHeight/4;
  
  //draw the logo on screen
  drawBoard(tetris, size, 0, yShift);

  return yShift;
}

function drawNextTetrominoType() {
  var next = logic.getNextTetrominoType();

  strokeWeight(tetrominoStrokeWidth);

  if(next != null) {
    var tetromino = new Tetromino(next, 0, 0, null, 0);

    var totalTetrominoWidth = tetromino.getWidth() * unitSize;
    var margin = (totalWidth - boardWidth) - totalTetrominoWidth;

    var xShift = boardWidth + margin/2;
    var yShift = margin/2 + (2-tetromino.getHeight())*unitSize;
   
    var tetrominoAsBoard = tetromino.getAsBoard();

    drawBoard(tetrominoAsBoard, unitSize, xShift, yShift);
  }
}

function drawBoard(matrix, size, xShift, yShift) {
  strokeWeight(tetrominoStrokeWidth);

  for(var i = 0; i < matrix.length; i++) {
    for(var j = 0; j < matrix[i].length; j++) {
      if(matrix[i][j].isOccupied) {
        fill(matrix[i][j].color);
        rect(xShift+j*size, yShift+i*size, size, size);
      }
    }
  }
};

function drawStats() {
  var level = logic.getLevel();
  var score = logic.getScore();
  var lines = logic.getLines();

  var marginLeft = 1;
  var marginRight = 4;
  var marginTopBottom = 4;

  strokeWeight(tetrominoStrokeWidth);

  fill(textColor);
  textSize(20);

  //current level 
  textAlign(LEFT, TOP);
  text("Level", statsX+rightPanelStrokeWidth+marginLeft, statsY+marginTopBottom, statsWidth, statsHeight);
  textAlign(RIGHT, TOP);
  text(level, statsX+rightPanelStrokeWidth-marginRight, statsY+marginTopBottom, statsWidth, statsHeight);

  //current score
  textAlign(LEFT, CENTER);
  text("Score", statsX+rightPanelStrokeWidth+marginLeft, statsY, statsWidth, statsHeight);
  textAlign(RIGHT, CENTER);
  text(score, statsX+rightPanelStrokeWidth-marginRight, statsY, statsWidth, statsHeight);

  //current total number of lines cleared
  textAlign(LEFT, BOTTOM);
  text("Lines", statsX+rightPanelStrokeWidth+marginLeft, statsY-marginTopBottom, statsWidth, statsHeight);
  textAlign(RIGHT, BOTTOM);
  text(lines, statsX+rightPanelStrokeWidth-marginRight, statsY-marginTopBottom, statsWidth, statsHeight);

}

function drawInfo() {
  strokeWeight(tetrominoStrokeWidth);

  var marginLeft = 1;
  
  fill(textColor);
  textSize(20);

  textAlign(CENTER, CENTER);

  //make text bold if mouse is hovering over the info sub-panel (to simulate a clickable button)
  if(mouseX>infoX && mouseX<(infoX + infoWidth) && mouseY>infoY && mouseY<(infoY+infoHeight)) {
    textStyle(BOLD);
  } else {
    textStyle(NORMAL);
  }

  text("Pause/Help", infoX+rightPanelStrokeWidth+marginLeft, infoY, infoWidth, infoHeight);

  textStyle(NORMAL);
}

function drawErrorScreen(e) {
  blurBoard();

  fill(textColor);
  strokeWeight(tetrominoStrokeWidth);
  textSize(40);
  textAlign(CENTER, CENTER);

  if(e == GameSignals.GameOver) {
    text("Game Over\n(click to restart)", 0, 0, boardWidth, height);
  } else if(e == GameSignals.Quit) {
    text("Quit\n(click to restart)", 0, 0, boardWidth, height);
  } else {
    text("Fatal Error\n(click to restart)", 0, 0, boardWidth, height);
    console.log(e);
  }
}

function drawPauseScreen() {
  blurBoard();

  drawPauseSymbol();

  //draw the game instructions 
  strokeWeight(tetrominoStrokeWidth);

  fill(textColor);
  textSize(20);

  textAlign(LEFT, CENTER);
  text("Left Arrow or A\n\nRight Arrow or D\n\nDown Arrow or S\n\nUp Arrow or W\n\nSpace\n\n\n\nP\n\nQ", 0, 0, boardWidth, height);
  
  textAlign(RIGHT, CENTER);
  text("Move Left\n\nMove Right\n\nSoft Drop\n\nRotate\n\nHard Drop\n\n\n\nToggle Pause\n\nQuit", 0, 0, boardWidth, height);
}

function drawPauseSymbol() {
  fill('red');
  strokeWeight(tetrominoStrokeWidth);

  rect(boardWidth/2 - pauseWidth/2, height/5-pauseHeight/2, pauseWidth, pauseHeight);
  rect(boardWidth/2 + (spacing-1/2)*pauseWidth, height/5-pauseHeight/2, pauseWidth, pauseHeight);
}

//blurs the tetris board
function blurBoard() {
  fill('rgba(0,0,0, 0.015)')
  strokeWeight(0);
  rect(0,0,boardWidth, height);
}

function drawRightPanel() {
  //main panel
  strokeWeight(0);
  fill(rightPanelBgColor);
  rect(boardWidth, 0, rightPanelWidth, height);

  //up next sub-panel
  fill(rightPanelBgColor)
  stroke('black');
  strokeWeight(rightPanelStrokeWidth);
  rect(upNextX, upNextY, upNextWidth, upNextHeight);

  //stats sub-panel
  fill(rightPanelBgColor)
  stroke('black');
  strokeWeight(rightPanelStrokeWidth);
  rect(statsX, statsY, statsWidth, statsHeight);

  //info sub-panel
  fill(rightPanelBgColor)
  stroke('black');
  strokeWeight(rightPanelStrokeWidth);
  rect(infoX, infoY, infoWidth, infoHeight);
}

function mouseClicked() {
  if(welcome) {
    welcome = false; 
    welcomeFallingTetromino = null;
  } else if(error != null) {
    error = null
    welcome = true;
    logic.clear();
    logic.createBoard;
  } else {
    paused = !paused;
  }
}

function keyPressed() {
  if(paused) {
    //do not respond to input while paused
    return
  } else if (keyCode === LEFT_ARROW) {
    try {
      logic.left();
    } catch (e) {
      processError(e);
    }
  } else if (keyCode === RIGHT_ARROW) {
    try {    
      logic.right();
    } catch (e) {
      processError(e);
    }
  } else if(keyCode == UP_ARROW) {
    try {
      logic.rotate();
    } catch (e) {
      processError(e);
    }
  } else if(keyCode == DOWN_ARROW) {
    try {
      logic.down();
    } catch (e) {
      processError(e);
    }
  } 
}

function keyTyped() {
  if (key === 'p') {
    if(!welcome) {
      try {
        paused = !paused;
      } catch (e) {
        processError(e);
      }
    }
  } else if(key === "q") {
    if(!welcome && !paused) {
      try {
        throw GameSignals.Quit;
      } catch(e) {
        processError(e);
      }
    }
  } else if(paused) {
    //do not respond to input while paused
    return
  } else if (key === 'w') {
    try {
      logic.rotate();
    } catch (e) {
      processError(e);
    }
  } else if (key === 's') {
    try {
      logic.down();
    } catch (e) {
      processError(e);
    }
  } else if (key === ' ') {
    try {
      logic.drop();
    } catch (e) {
      processError(e);
    }
  } else if (key === 'a') {
    try {
      logic.left();
    } catch (e) {
      processError(e);
    }
  } else if (key === 'd') {
    try {
      logic.right();
    } catch (e) {
      processError(e);
    }
  }
}

function processError(e) {
  error = e;
}