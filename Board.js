//represents the tetris board
//x: width of the board
//y: height of the board
var Board = function(x, y) {

	//width of the board
	this.x = x;

	//height of the board
	this.y = y; 

	//2-dimensional matrix representing the board
	this.board = []; 

	//initialize the board to being completly empty (no entries occupied)
	for(var i = 0; i < this.y; i++) {
		this.board[i] = [];
		for(var j = 0; j < this.x; j++) {
			this.board[i][j] = new Entry(false, null);
		}
	}

	//add a tetromino to the tetris board
	//tetromino: tetromino to be added
	this.addNewTetromino = function(tetromino) {		
		var boardIndexX = tetromino.getX();
		var boardIndexY = tetromino.getY();
		
		for(var z=0; z<tetromino.getHeight(); z++) {
			for(var i=0; i<tetromino.getWidth(); i++) {
				if(tetromino.matrix[z][i]) {
					this.board[boardIndexY][boardIndexX] = new Entry(true, tetromino.type);
				}
				boardIndexX++;
			}
			boardIndexX = tetromino.currentX;
			boardIndexY++;
		}
	}

	//check the board for complete rows. remove the complete rows
	//return the number of rows that were cleared
	this.checkAndClear = function() {
		var rowsToClear = []

		Loop1: 
		for(var i = 0; i < this.y; i++) {
			var fullRow = true; 
			
			Loop2:
			for(var j = 0; j < this.x; j++) {
				if(!this.board[i][j].isOccupied) {
					fullRow = false; 
					break Loop2;
				}
			}

			if(fullRow) {
				rowsToClear.push(i);
			}
		}

		if(rowsToClear.length > 0) {
			this.clearRows(rowsToClear);
		}

		return rowsToClear.length;
	}

	//clears the rows that were found to be complete.
	//shifts the remaining board down to fill the gap remaining gap. 
	//rowsToClear: array of row indexes. Indexes of rows that were found to be complete.
	this.clearRows = function(rowsToClear) {
		//1. clear filled rows
		for(var i = 0; i < rowsToClear.length; i++) {
			for(var j = 0; j < this.board[rowsToClear[i]].length; j++) {
				this.board[rowsToClear[i]][j] = new Entry(false, null);
			}
		}

		//2. shift board downwards
		var dstRow = Math.max.apply(Math, rowsToClear);
		var lowestUnclearedRow = Math.min.apply(Math, rowsToClear) - 1;

		for(var i = lowestUnclearedRow; i >= 0; i--) {
			for(var j = 0; j < this.board[i].length; j++) {
				this.board[dstRow][j] = this.board[i][j];
			}
			dstRow--;
		}
	};

	//removes a tetromino from the board
	//tetromino: tetromino to be removed
	this.removeTetromino = function(tetromino) {
		var boardIndexX = tetromino.getX();
		var boardIndexY = tetromino.getY();
		
		for(var z=0; z<tetromino.getHeight(); z++) {
			for(var i=0; i<tetromino.getWidth(); i++) {
				if(tetromino.matrix[z][i]) {
					this.board[boardIndexY][boardIndexX] = new Entry(false, null);
				}
				boardIndexX++;
			}
			boardIndexX = tetromino.currentX;
			boardIndexY++;
		}
	};

	//check if a tetromino can be added to the board at a specified location
	//it is possible that a tetromino cannot be added at a specified location, if squares are already occupied
	//tetromino: tetromino which we want to see if we can add to the tetris board
	this.canAdd = function(tetromino) {
		var boardIndexX = tetromino.getX();
		var boardIndexY = tetromino.getY();

		for(var z=0; z<tetromino.getHeight(); z++) {
			for(var i=0; i<tetromino.getWidth(); i++) {
				if(boardIndexX > this.x-1 || boardIndexY > this.y-1 || boardIndexX < 0 || boardIndexY < 0) {
					return false; 
				}

				if(tetromino.matrix[z][i] && this.board[boardIndexY][boardIndexX].isOccupied) {
					return false;
				}
				boardIndexX++;
			}
			boardIndexX = tetromino.currentX;
			boardIndexY++;
		}

		return true;
	}

	//remove a tetromino that is already in the board and replace it with another
	//replaceBy: tetromino to add
	//toReplace: tetromino to replace
	this.swapIfPossible = function(replaceBy, toReplace) {
		this.removeTetromino(toReplace);

		var canAdd = this.canAdd(replaceBy);

		if(canAdd) {
			this.addNewTetromino(replaceBy);
			return replaceBy
		} else {
			this.addNewTetromino(toReplace);
			return toReplace;
		}
	}

	//clears the board. sets all entries to false (no occupied entries)
	this.clear = function() {
		for(var i=0; i<this.board.length; i++) {
			for(var j=0; j<this.board[i].length; j++) {
				this.board[i][j] = new Entry(false, null);
			}
		}
	}
}