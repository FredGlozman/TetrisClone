//represents the state of a tetromino being dropped
//type:        the type of this tetromino (1 out of the 7 possible types)
//x:           the x position of this tetromino
//y:           the y position of this tetromino
//rotateCount: the number of rotations this tetromino has undergone
var Tetromino = function(type, x, y, matrix, rotateCount) {
	//1 of the 7 types of tetrominoes and its corresponding color
	this.type = type;

	//2-dimensional array representing the tetromino
	this.matrix = matrix;

	//number of times the tetromino has been rotated
	//this number is 0 when the tetromino is in its initial configuration
	//after each rotation, this number is incremented. 
	//this number is reset to zero after each complete revolution
	this.rotateCount = rotateCount;

	//current (x,y) position of the tetromino on the tetris board
	this.currentX = x;
	this.currentY = y;

	//initialize the tetromino if no configuration was specified
	if(this.matrix == null) {

		this.matrix = [];

		//hardcoded default tetromino configurations
		switch(this.type) {
			case(TetrominoType.O):
				this.matrix[0] = [true, true];
				this.matrix[1] = [true, true];

				break;
			case(TetrominoType.I):
				this.matrix[0] = [true, true, true, true];

				break;
			case(TetrominoType.T):
				this.matrix[0] = [false, true, false];
				this.matrix[1] = [true, true, true];

				break;
			case(TetrominoType.S):
				this.matrix[0] = [false, true, true];
				this.matrix[1] = [true, true, false];

				break;
			case(TetrominoType.Z):
				this.matrix[0] = [true, true, false];
				this.matrix[1] = [false, true, true];

				break;
			case(TetrominoType.J):
				this.matrix[0] = [true, false, false];
				this.matrix[1] = [true, true, true];

				break;		
			case(TetrominoType.L):
				this.matrix[0] = [false, false, true];
				this.matrix[1] = [true, true, true];

				break;				
		};
	}

	//rotate the tetromino a single time
	this.rotate = function() {
		//matrix transpose of the tetromino (rotates the piece)
		this.transpose();

		//adjust current position 
		switch(this.type) {
		case(TetrominoType.O):
			//it's a square. nothing to do.
			break;
		case(TetrominoType.I):
			//was [true, true, true, true]
			//became [true, true, true, true]^T
			//shifts up by 2 and to the right by 2. 
			if(this.rotateCount%2 == 0) {
				this.setCurrentPosition(this.currentX+2, this.currentY-2);
			} 
			//was [true, true, true, true]^T
			//became [true, true, true, true]
			//shifts down by 2 and to the left by 2. 
			else {
				this.setCurrentPosition(this.currentX-2, this.currentY+2);

				//full rotation, reset counter
				this.rotateCount = -1;
			}

			this.rotateCount++;

			break;
		case(TetrominoType.S):
		case(TetrominoType.Z):
			if(this.rotateCount%2 == 0) {
				this.setCurrentPosition(this.currentX+1, this.currentY-1);
			} 
			else {
				this.setCurrentPosition(this.currentX-1, this.currentY+1);

				//full rotation, reset counter
				this.rotateCount = -1;
			}

			this.rotateCount++;

			break;
		case(TetrominoType.T):
		case(TetrominoType.J):	
		case(TetrominoType.L):
			if(this.rotateCount%4 == 0) {
				this.setCurrentPosition(this.currentX+1, this.currentY);
			} else if((this.rotateCount-1)%4 == 0) {
				this.setCurrentPosition(this.currentX-1, this.currentY+1);
			} else if((this.rotateCount-2)%4 == 0) {
				this.setCurrentPosition(this.currentX, this.currentY-1);
			} else if((this.rotateCount-3)%4 == 0) {
				this.setCurrentPosition(this.currentX, this.currentY+1);

				//full rotation, reset counter
				this.rotateCount = -1;
			}

			this.rotateCount++;

			break;					
		};
	};

	//performs a matrix transpose (rotates the tetromino)
	this.transpose = function() {
		var temp = this.matrix;
		this.matrix = [];

		for(var i = 0; i < temp[0].length; i++) {
			this.matrix[i] = [];
			for(var j = 0; j < temp.length; j++) {
				this.matrix[i][temp.length-j-1] = temp[j][i];
			}
		}
	};

	//returns the tetromino as a tetris board. can be drawn onto screen just like the tetris game board
	this.getAsBoard = function() {
	    var board = []

	    //first need to convert the tetromino array to an array that can be printed onto the screen just like the tetris board
	    for(var i = 0; i < this.matrix.length; i++) {
	      board[i] = [];
	      for(var j = 0; j < this.matrix[i].length; j++) {
	        if(this.matrix[i][j]) {
	          board[i][j] = new Entry(true, this.type);
	        } else {
	          board[i][j] = new Entry(false, null);
	        }
	      }
	    }

	    return board
	}

	//returns the rotated version of this tetromino
	this.getRotated = function() {
		var rotated = new Tetromino(this.type, this.currentX, this.currentY, this.matrix, this.rotateCount);
		rotated.rotate();

		return rotated;
	}

	//returns the version of this tetromino shiftet to the left by one
	this.getShiftedLeft = function() {
		return new Tetromino(this.type, this.currentX-1, this.currentY, this.matrix, this.rotateCount);
	}

	//returns the version of this tetromino shiftet to the right by one
	this.getShiftedRight = function() {
		return new Tetromino(this.type, this.currentX+1, this.currentY, this.matrix, this.rotateCount);
	}

	//returns the version of this tetromino shifted down by one
	this.getShiftedDown = function() {
		return new Tetromino(this.type, this.currentX, this.currentY+1, this.matrix, this.rotateCount);	
	}
	
	//returns the height of this tetromino
	this.getHeight = function() {
		return this.matrix.length;
	};

	//returns the width of this tetromino
	this.getWidth = function() {
		return this.matrix[0].length;
	};

	//sets the current (x,y) position of this tetromino on the tetris board
	this.setCurrentPosition = function(x,y) {
		this.currentX = x;
		this.currentY = y;
	};

	//returns the current x position of the tetromino
	this.getX = function() {
		return this.currentX;
	}

	//returns the current y position of the tetromino
	this.getY = function() {
		return this.currentY;
	}
}