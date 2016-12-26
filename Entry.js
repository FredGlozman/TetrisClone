//represents the state of a square on the tetris board
//if isOccupied is true, a square will be drawn of the specified color on the tetris board
//isOccupied: true if the square is occupuied by a tetronimo unit and false otherwise
//color:      color of the unit
var Entry = function(isOccupied, color) {
	this.isOccupied = isOccupied;
	this.color = color;
}
