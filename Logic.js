//x: width of the board
//y: height of the board
var Logic = function(x,y) {
	//points allocated for each square unit dropped (a tetromino is made up of square units)
	this.pointsForSingleSquare = 1;

	//number of rows that need to be cleared in order to level up
	this.levelUp = 10;

	//faster possible speed 
	this.floorSpeed = 4;

	//current level, score and total number of cleared lines
	this.level = 0;
	this.score = 0;
	this.totalNumberOfLinesCleared = 0;

	//number of times the update method was called 
	this.updateCount = -1;

	//current speed. update actually updates the board after every 48 frames.
	this.speed = 48;

	//last tetromino type that was dropped
	this.prevTetrominoType = null;

	//the tetromino type that will be dropped next.
	this.nextTetrominoType = null;
	
	//width and height of the tetris board
	this.x = x;
	this.y = y; 
		
	//creates the tetris board
	this.board = new Board(x,y);

	//returns the 2-dimensional array which represents the current state of the tetris board 
	this.getMatrix = function() {
		return this.board.board;
	}

	//update the state of the tetris board
	this.updateBoard = function() {
		this.updateCount++;

		//this ensures that this board does not get updated at the same rate as the UI
		//the board is actually updated every (this.speed) number of frames
		if(this.updateCount % this.speed != 0) {
			return;
		}

		//there's no tetromino currently being dropped. need to create a new one.
		if(this.currentFallingTetromino == null) {
			if(this.nextTetrominoType == null) {
				this.currentFallingTetromino = new Tetromino(this.randomTetromino(), 0, 0, null, 0);
				this.nextTetrominoType = this.randomTetromino();
			} else {
				this.currentFallingTetromino = new Tetromino(this.nextTetrominoType, 0, 0, null, 0);
				this.nextTetrominoType = this.randomTetromino();
			}

			//generate a random initial x position for the new tetromino
			var randomX = this.getRandomTetrominoStartingX(this.currentFallingTetromino);

			this.currentFallingTetromino.setCurrentPosition(randomX, 0);

			if(this.board.canAdd(this.currentFallingTetromino)) {
				this.board.addNewTetromino(this.currentFallingTetromino);
			} 
			//can't add this piece to the board. means that the board is filled to the top. player lost.
			else {
				throw GameSignals.GameOver;
			}
		} else {
			this.down();
		}
	};

	//generates a random x position on the tetris board
	this.getRandomTetrominoStartingX = function(tetromino) {
		var tetronimoWidth = tetromino.getWidth();
		var randomX = Math.floor(Math.random()*((this.x-tetronimoWidth)-0+1))+0;

		return randomX;
	}

	//randomly select a tetromino type
	this.randomTetromino = function() {
		var random = Math.floor(Math.random()*(7-0+1))+0;
		var randomType = this.randomTetrominoMapping(random);

		if(randomType == null || (this.prevTetrominoType != null && this.prevTetrominoType == randomType)) {
			random = Math.floor(Math.random()*(6-0+1))+0;
			randomType = this.randomTetrominoMapping(random);
		}

		return randomType;
	};

	//number to tetromino type mapping
	this.randomTetrominoMapping = function(random) {
		if(random==0) {
			return TetrominoType.I;
		} else if(random==1) {
			return TetrominoType.O;
		} else if(random==2) {
			return TetrominoType.T;
		} else if(random==3) {
			return TetrominoType.S;
		} else if(random==4) {
			return TetrominoType.Z;
		} else if(random==5) {
			return TetrominoType.J;
		} else if(random==6) {
			return TetrominoType.L;
		} else if(random==7) {
			return null;
		}
	}

	//returns the number of individual unit squares in the tetromino piece
	this.unitsCount = function(tetromino) {
		var count = 0;
		for(var i = 0; i < tetromino.getHeight(); i++) {
			for(var j = 0; j < tetromino.getWidth(); j++) {
				if(tetromino.matrix[i][j]) {
					count++;
				}
			}
		}

		return count;
	}

	//shifts the tetromino piece down by one square
	this.down = function() {
		if(this.currentFallingTetromino != null) {
			var shiftedTetromino = this.currentFallingTetromino.getShiftedDown(); 

			var result = this.board.swapIfPossible(shiftedTetromino, this.currentFallingTetromino);

			if(result == this.currentFallingTetromino) {
				this.prevTetrominoType = this.currentFallingTetromino.type;
				this.currentFallingTetromino = null;

				var numberOfLinesCleared = this.board.checkAndClear();
				this.totalNumberOfLinesCleared += numberOfLinesCleared;

				this.updateScore(result, numberOfLinesCleared); 

				this.updateLevelAndSpeed();
								
			} else {
				this.currentFallingTetromino = result;
			}
		}
	}

	//updates the current level and the current speed of the game
	this.updateLevelAndSpeed = function() {
		var currentLevel = Math.floor(this.totalNumberOfLinesCleared/this.levelUp);
				
		if(currentLevel > this.level && this.speed > this.floorSpeed) {
			this.level = currentLevel;

			//[0,7]
			if(this.level <= 7) {
				this.speed -= 5;
			} 
			//[8]
			else if(this.level == 8) {
				this.speed -= 2;
			} 
			//[7,28]
			else if(this.level < 29) {
				this.speed -= 1;
			}
		}
	};

	//updates the current score
	this.updateScore = function(tetromino, numberOfLinesCleared) {
		this.score += this.pointsForSingleSquare * this.unitsCount(tetromino);

		if(numberOfLinesCleared == 1) {
			this.score += (40*(this.level+1));
		} else if(numberOfLinesCleared == 2) {
			this.score += (100*(this.level+1));
		} else if(numberOfLinesCleared == 3) {
			this.score += (300*(this.level+1));
		} else if(numberOfLinesCleared == 4) {
			this.score += (1200*(this.level+1));
		}
	};

	//hard drop the tetromino piece
	this.drop = function() {
		while(this.currentFallingTetromino != null) {
			this.down();
		}
	}

	//shifts the tetromino piece left by one square
	this.left = function() {
		if(this.currentFallingTetromino != null) {

			var shiftedTetromino = this.currentFallingTetromino.getShiftedLeft(); 

			this.currentFallingTetromino = this.board.swapIfPossible(shiftedTetromino, this.currentFallingTetromino);

		}
	};

	//shifts the tetromino piece right by one square
	this.right = function() {
		if(this.currentFallingTetromino != null) {

			var shiftedTetromino = this.currentFallingTetromino.getShiftedRight(); 

			this.currentFallingTetromino = this.board.swapIfPossible(shiftedTetromino, this.currentFallingTetromino);

		}
	};

	//rotate the tetromino once
	this.rotate = function() {
		if(this.currentFallingTetromino != null) {

			var rotatedTetromino = this.currentFallingTetromino.getRotated(); 

			this.currentFallingTetromino = this.board.swapIfPossible(rotatedTetromino, this.currentFallingTetromino);
		
		}
	};

	//returns the type of the next tetromino
	this.getNextTetrominoType = function() {
		return this.nextTetrominoType;
	};

	//returns the current stats as a string
	this.getStats = function() {
		return "Level: " + this.level + "\n" + "Score: " + this.score + "\n" + "Lines: " + this.totalNumberOfLinesCleared;
	};

	//return the total number of lines cleared
	this.getLines = function() {
		return this.totalNumberOfLinesCleared;
	};

	//returns the current score
	this.getScore = function() {
		return this.score;
	};

	//returns the current level
	this.getLevel = function() {
		return this.level;
	};

	//clears the state of the game. re-initializes the state back to zero
	this.clear = function() {
		this.currentFallingTetromino = null;
		this.board.clear();

		//reseting state
		this.level = 0;
		this.score = 0;
		this.totalNumberOfLinesCleared = 0;

		this.updateCount = -1;
		this.speed = 48;

		this.prevTetrominoType = null;
		this.nextTetrominoType = null;
	};
}