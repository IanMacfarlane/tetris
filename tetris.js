/*
 Tetris
 Ian Macfarlane
 A02243880
*/

let prevTime = performance.now();

let canvas = document.getElementById('myCanvas');
let context = canvas.getContext('2d');

window.addEventListener('keydown', onKeyDown);
window.addEventListener('keyup', onKeyUp);
canvas.addEventListener('click', onClick);

let music = new Audio('music.mp3');
music.addEventListener('ended', function() {
	this.currentTime = 0;
	this.play();
}, false);

let lock = new Audio('lock.wav');
let clear = new Audio('clear.wav');

// initialize variables
let livePiece = [];// tracks location of current piece?
let nextPiece = [];
let gameBoard = [];// tracks dead pieces, live piece, and colors
for (let i = 0; i < 20; i++) {
	gameBoard.push([]);
	for (let j = 0; j < 10; j++) {
		gameBoard[i].push(null);
	}
}

let tetrominoes = [// starting position of each type of tetris piece
	[{x:3,y:0},{x:4,y:0},{x:5,y:0},{x:6,y:0},'cyan'],// cyan
	[{x:4,y:0},{x:4,y:1},{x:5,y:1},{x:6,y:1},'blue'],// blue
	[{x:4,y:1},{x:5,y:1},{x:6,y:1},{x:6,y:0},'orange'],// orange
	[{x:4,y:0},{x:5,y:0},{x:4,y:1},{x:5,y:1},'yellow'],// yellow
	[{x:4,y:1},{x:5,y:1},{x:5,y:0},{x:6,y:0},'green'],// green
	[{x:4,y:1},{x:5,y:1},{x:5,y:0},{x:6,y:1},'purple'],// purple
	[{x:4,y:0},{x:5,y:0},{x:5,y:1},{x:6,y:1},'red']// red
];

let dropTimer = 0;
let translateTimer = 0;
let level = 0;
let score = 0;
let linesCleared = 0;
let tempLinesCleared = 0;
let newGame = false;
let gameOver = false;
let noStart = true;

let showHighScores = false;
let showCredits = false;
let showControls = false;
let changeKey = false;

// initialize controls, persist from browser
let controls = {
	left: 37,
	right: 39,
	counter: 36,
	clockwise: 33,
	softDrop: 40,
	hardDrop: 38
};
if (localStorage.left)
	controls.left = Number(localStorage.left);
if (localStorage.right)
	controls.right = Number(localStorage.right);
if (localStorage.counter)
	controls.counter = Number(localStorage.counter);
if (localStorage.clockwise)
	controls.clockwise = Number(localStorage.clockwise);
if (localStorage.softDrop)
	controls.softDrop = Number(localStorage.softDrop);
if (localStorage.hardDrop)
	controls.hardDrop = Number(localStorage.hardDrop);

// initalize input variables, use to track async input
let input = {
	left: false,
	right: false,
	counter: false,
	clockwise: false,
	softDrop: false,
	hardDrop: false
};

gameLoop(prevTime);

function gameLoop(timeStamp) {
	elapsedTime = timeStamp - prevTime;
	prevTime = timeStamp;

	processInput();
	update(elapsedTime);
	render();

	requestAnimationFrame(gameLoop);
}

function onKeyDown(e) {
	if (changeKey) {
		if (changeKey === 'right') {
			localStorage.right = e.keyCode;
			controls.right = e.keyCode;
			changeKey = false;
		}
		if (changeKey === 'left') {
			localStorage.left = e.keyCode;
			controls.left = e.keyCode;
			changeKey = false;
		}
		if (changeKey === 'counter') {
			localStorage.counter = e.keyCode;
			controls.counter = e.keyCode;
			changeKey = false;
		}
		if (changeKey === 'clockwise') {
			localStorage.clockwise = e.keyCode;
			controls.clockwise = e.keyCode;
			changeKey = false;
		}
		if (changeKey === 'softDrop') {
			localStorage.softDrop = e.keyCode;
			controls.softDrop = e.keyCode;
			changeKey = false;
		}
		if (changeKey === 'hardDrop') {
			localStorage.hardDrop = e.keyCode;
			controls.hardDrop = e.keyCode;
			changeKey = false;
		}
	}
	else {
		if (e.keyCode === controls.left) {
			input.left = true;
		}
		if (e.keyCode === controls.right) {
			input.right = true;
		}
		if (e.keyCode === controls.counter) {
			input.counter = true;
		}
		if (e.keyCode === controls.clockwise) {
			input.clockwise = true;
		}
		if (e.keyCode === controls.softDrop) {
			input.softDrop = true;
		}
		if (e.keyCode === controls.hardDrop) {
			input.hardDrop = true;
		}
	}
}
function onKeyUp(e) {
	if (e.keyCode === controls.left) {
		input.left = false;
	}
	if (e.keyCode === controls.right) {
		input.right = false;
	}
	if (e.keyCode === controls.softDrop) {
		input.softDrop = false;
	}
}
function onClick(e) {

	let xClick = e.pageX-canvas.offsetLeft;
	let yClick = e.pageY-canvas.offsetTop;

	// if new game
	if (xClick > 50 && xClick < 200 && yClick > 50 && yClick < 100) {

		livePiece = [];// tracks location of current piece?
		nextPiece = [];
		gameBoard = [];// tracks dead pieces, live piece, and colors
		for (let i = 0; i < 20; i++) {
			gameBoard.push([]);
			for (let j = 0; j < 10; j++) {
				gameBoard[i].push(null);
			}
		}

		dropTimer = 0;
		translateTimer = 0;
		level = 0;
		score = 0;
		linesCleared = 0;
		tempLinesCleared = 0;
		newGame = true;
		gameOver = false;
		noStart = false;
		music.play();
	}

	// if high scores
	if (xClick > 50 && xClick < 200 && yClick > 150 && yClick < 200) {
		showHighScores = true;
		showCredits = false;
		showControls = false;
	}

	// if controls
	if (xClick > 50 && xClick < 200 && yClick > 250 && yClick < 300) {
		showControls = true;
		showHighScores = false;
		showCredits = false;
	}

	// if credits
	if (xClick > 50 && xClick < 200 && yClick > 350 && yClick < 400) {
		showCredits = true;
		showHighScores = false;
		showControls = false;
	}

	if (showControls) {
		// each control click
		if (xClick > 180 && xClick < 230 && yClick > 470 && yClick < 520) {
			changeKey = 'right';
		}
		if (xClick > 180 && xClick < 230 && yClick > 520 && yClick < 570) {
			changeKey = 'left';
		}
		if (xClick > 180 && xClick < 230 && yClick > 570 && yClick < 620) {
			changeKey = 'counter';
		}
		if (xClick > 180 && xClick < 230 && yClick > 620 && yClick < 670) {
			changeKey = 'clockwise';
		}
		if (xClick > 180 && xClick < 230 && yClick > 670 && yClick < 720) {
			changeKey = 'softDrop';
		}
		if (xClick > 180 && xClick < 230 && yClick > 720 && yClick < 770) {
			changeKey = 'hardDrop';
		}
	}
}

function processInput() {

	// shape translation 
	if ((input.left || input.right) && translateTimer >= 70) {
		translateTimer = 0;

		if (input.left) {
			translatePiece('left');
		}
		if (input.right) {
			translatePiece('right');
		}
		placePiece();

	}

	// shape rotation,
	rotatePiece();

	// soft drop
	if (input.softDrop && dropTimer >= 50) {
		dropTimer = 0;

		let tempPiece = [];
		for (let i = 0; i < 4; i++) {
			tempPiece.push({x:livePiece[i].x,y:livePiece[i].y});
		}
		tempPiece.push(livePiece[4]);

		let moveAllowed = true;

		// remove livePiece from board
		removePiece();

		// move each point in livePiece down
		for (let i = 0; i < 4; i++) {
			if (livePiece[i].y === 19 || (livePiece[i].y > 0 && gameBoard[livePiece[i].y+1][livePiece[i].x])) {
				moveAllowed = false;
			}
		}

		// if cant move dont
		if (moveAllowed) {
			score++;
			livePiece[0].y++;
			livePiece[1].y++;
			livePiece[2].y++;
			livePiece[3].y++;
		}
		else {
			livePiece = tempPiece;
		}

		// put livePiece on board
		placePiece();

		// lock piece
		if (!moveAllowed) {
			// check for overflow game over
			for (let j = 0; j < 4; j++) {
				if (livePiece[j].y === 0) {
					gameOver = true;
					// persist score to browser
					highScore(score);
				}
			}
			livePiece = [];
			input.softDrop = false;
			checkLines();
			lock.play();
		}
	}

	// hard drop
	if (input.hardDrop) {
		input.hardDrop = false;

		let tempPiece = [];
		for (let i = 0; i < 4; i++) {
			tempPiece.push({x:livePiece[i].x,y:livePiece[i].y});
		}
		tempPiece.push(livePiece[4]);

		let moveAllowed = true;

		// remove livePiece from board
		removePiece();

		// move each point in livePiece down
		while (moveAllowed) {
			for (let i = 0; i < 4; i++) {
				if (tempPiece[i].y === 19 || gameBoard[tempPiece[i].y+1][tempPiece[i].x]) {
					moveAllowed = false;
				}
			}
			if (moveAllowed) {
				score++;
				tempPiece[0].y++;
				tempPiece[1].y++;
				tempPiece[2].y++;
				tempPiece[3].y++;
			}
		}

		livePiece = tempPiece;

		// put livePiece on board
		placePiece();
		// check for overflow game over
		for (let j = 0; j < 4; j++) {
			if (livePiece[j].y === 0) {
				gameOver = true;
				// persist score to browser
				highScore(score);
			}
		}
		livePiece = [];
		checkLines();
		lock.play();
	}

}

function update(elapsedTime) {

	if (!noStart && !gameOver) {
		if (newGame) {
			newGame = false;

			// select random piece
			let tempPiece = tetrominoes[Math.floor(Math.random()*7)];
			for (let i = 0; i < 4; i++) {
				livePiece.push({x:tempPiece[i].x,y:tempPiece[i].y});
			}
			livePiece.push(tempPiece[4]);

			tempPiece = tetrominoes[Math.floor(Math.random()*7)];
			for (let i = 0; i < 4; i++) {
				nextPiece.push({x:tempPiece[i].x,y:tempPiece[i].y});
			}
			nextPiece.push(tempPiece[4]);

			// put new piece on board
			placePiece();
			
		}
		// new tetris piece
		else if (livePiece.length === 0) {

			livePiece = nextPiece;

			// if livePiece is on top of piece game over
			for (let i = 0; i < 4; i++) {
				if (gameBoard[livePiece[i].y][livePiece[i].x]) {
					gameOver = true;
				}
			}

			if (!gameOver) {
				// select random piece
				nextPiece = [];
				let tempPiece = tetrominoes[Math.floor(Math.random()*7)];
				for (let i = 0; i < 4; i++) {
					nextPiece.push({x:tempPiece[i].x,y:tempPiece[i].y});
				}
				nextPiece.push(tempPiece[4]);

				// put new piece on board
				placePiece();
			}
		}

		dropTimer += elapsedTime;
		if (input.left || input.right) {
			translateTimer += elapsedTime;
		}

		// piece auto drop, level speed
		if (dropTimer >= 1000/(level+1)) {
			autoDrop();
		}

		// incramant level every 10 lines cleared
		if (tempLinesCleared >= 10) {
			tempLinesCleared -= 10;
			gameOver = true;
			level++;
			if (level === 10) {
				// game over
				gameOver = true;
				// persist score to browser
				highScore(score);
			}
		}
	}

	// TODO ai component attract mode
}

function render() {

	context.clearRect(0, 0, canvas.width, canvas.height);

	// grid border color
	context.strokeStyle = '#888';

	// draw game board
	for (let i = 0; i < gameBoard.length; i++) {
		for (let j = 0; j < gameBoard[i].length; j++) {
			
			switch (gameBoard[i][j]) {
				case 'cyan':
					context.fillStyle = '#0e787f';
					break;
				case 'blue':
					context.fillStyle = '#0043b7';
					break;
				case 'orange':
					context.fillStyle = '#b76100';
					break;
				case 'yellow':
					context.fillStyle = '#afa02b';
					break;
				case 'green':
					context.fillStyle = '#12543c';
					break;
				case 'purple':
					context.fillStyle = '#4c2a9e';
					break;
				case 'red':
					context.fillStyle = '#9e1816';
					break;
				default:
					context.fillStyle = '#000';
			}
			if (j < 10) {
				context.fillRect(j*50+250,i*50,50,50);
				context.strokeRect(j*50+250,i*50,50,50);
			}
		}
	}

	// show current score
	context.font = '16px Monospace';
	context.fillStyle = '#fff';
	context.fillText('SCORE ' + score, 800, 50);

	// show current level
	context.fillText('LEVEL ' + level, 800, 100);

	// show line eliminated
	context.fillText('LINES ' + linesCleared, 800, 150);

	// show next shape
	context.fillText('NEXT', 800, 200);
	switch (nextPiece[4]) {
		case 'cyan':
			context.fillStyle = '#0e787f';
			break;
		case 'blue':
			context.fillStyle = '#0043b7';
			break;
		case 'orange':
			context.fillStyle = '#b76100';
			break;
		case 'yellow':
			context.fillStyle = '#afa02b';
			break;
		case 'green':
			context.fillStyle = '#12543c';
			break;
		case 'purple':
			context.fillStyle = '#4c2a9e';
			break;
		case 'red':
			context.fillStyle = '#9e1816';
			break;
	}
	for (let i = 0; i < nextPiece.length; i++) {
		if (nextPiece[4] === 'cyan' || nextPiece[4] === 'yellow') {
			context.fillRect(nextPiece[i].x*50+625,nextPiece[i].y*50+210,50,50);
			context.strokeRect(nextPiece[i].x*50+625,nextPiece[i].y*50+210,50,50);
		}
		else {
			context.fillRect(nextPiece[i].x*50+600,nextPiece[i].y*50+210,50,50);
			context.strokeRect(nextPiece[i].x*50+600,nextPiece[i].y*50+210,50,50);
		}
	}

	if (gameOver) {
		context.font = '32px Monospace';
		context.fillStyle = '#fff';
		context.fillText('GAME OVER', 420, 500);
	}

	// new game
	context.font = '20px Monospace';
	context.fillStyle = '#999';
	context.fillRect(50,50,150,50);
	context.fillStyle = '#000';
	context.fillText('NEW GAME', 80, 80);

	// high scores
	context.fillStyle = '#999';
	context.fillRect(50,150,150,50);
	context.fillStyle = '#000';
	context.fillText('HIGH SCORES', 60, 180);

	// controls, can be changed, persist to browser
	context.fillStyle = '#999';
	context.fillRect(50,250,150,50);
	context.fillStyle = '#000';
	context.fillText('CONTROLS', 80, 280);

	// credits
	context.fillStyle = '#999';
	context.fillRect(50,350,150,50);
	context.fillStyle = '#000';
	context.fillText('CREDITS', 85, 380);

	if (showHighScores) {
		if (localStorage.score) {
			let board = JSON.parse(localStorage.score);

			context.fillStyle = '#fff';
			context.fillText('HIGH SCORES', 60, 500);
			for (let i = 0; i < board.length; i++) {
				context.fillText(board[i], 100, 550+i*50);
			}
		}
		else {
			// no scores
			context.fillStyle = '#fff';
			context.fillText('NO SCORES', 125, 500);
		}
	}
	else if (showCredits) {
		context.fillStyle = '#fff';
		context.fillText('DEVELOPED BY', 55, 500);
		context.fillText('IAN MACFARLANE', 45, 550);
	}
	else if (showControls) {
		// controls ui
		context.font = '16px Monospace';
		context.strokeStyle = '#000';

		context.fillStyle = '#fff';
		context.fillText('TRANSLATE RIGHT', 10, 500);
		context.fillStyle = '#999';
		context.fillRect(180,470,50,50);
		context.strokeRect(180,470,50,50);
		if (changeKey !== 'right') {
			context.fillStyle = '#000';
			context.fillText(controls.right, 195, 500);
		}

		context.fillStyle = '#fff';
		context.fillText('TRANSLATE LEFT', 10, 550);
		context.fillStyle = '#999';
		context.fillRect(180,520,50,50);
		context.strokeRect(180,520,50,50);
		if (changeKey !== 'left') {
			context.fillStyle = '#000';
			context.fillText(controls.left, 195, 550);
		}

		context.fillStyle = '#fff';
		context.fillText('ROTATE COUNTER', 10, 600);
		context.fillStyle = '#999';
		context.fillRect(180,570,50,50);
		context.strokeRect(180,570,50,50);
		if (changeKey !== 'counter') {
			context.fillStyle = '#000';
			context.fillText(controls.counter, 195, 600);
		}

		context.fillStyle = '#fff';
		context.fillText('ROTATE CLOCKWISE', 10, 650);
		context.fillStyle = '#999';
		context.fillRect(180,620,50,50);
		context.strokeRect(180,620,50,50);
		if (changeKey !== 'clockwise') {
			context.fillStyle = '#000';
			context.fillText(controls.clockwise, 195, 650);
		}

		context.fillStyle = '#fff';
		context.fillText('SOFT DROP', 10, 700);
		context.fillStyle = '#999';
		context.fillRect(180,670,50,50);
		context.strokeRect(180,670,50,50);
		if (changeKey !== 'softDrop') {
			context.fillStyle = '#000';
			context.fillText(controls.softDrop, 195, 700);
		}

		context.fillStyle = '#fff';
		context.fillText('HARD DROP', 10, 750);
		context.fillStyle = '#999';
		context.fillRect(180,720,50,50);
		context.strokeRect(180,720,50,50);
		if (changeKey !== 'hardDrop') {
			context.fillStyle = '#000';
			context.fillText(controls.hardDrop, 195, 750);
		}
	}

	// TODO Node.js server, dynamic loading
	// TODO particle effects
}

function placePiece() {
	for (let j = 0; j < 4; j++) {
		if (livePiece[j].y >= 0) {
			gameBoard[livePiece[j].y][livePiece[j].x] = livePiece[4];
		}
	}
	
}

function removePiece() {
	// remove livePiece from board
	for (let i = 0; i < 4; i++) {
		if (livePiece[i].y >= 0 && livePiece[i].y < 20) {
			gameBoard[livePiece[i].y][livePiece[i].x] = null;
		}
	}
}

function translatePiece(direction) {
	let tempPiece = [];
	for (let i = 0; i < 4; i++) {
		tempPiece.push({x:livePiece[i].x,y:livePiece[i].y});
	}
	tempPiece.push(livePiece[4]);

	let moveAllowed = true;

	// remove livePiece from board
	if (input.right || input.left) {
		removePiece();
	}

	if (direction === 'left') {
		// move each point in livePiece left
		for (let i = 0; i < 4; i++) {
			if (livePiece[i].x !== 0 && ((livePiece[i].y >= 0 && !gameBoard[livePiece[i].y][livePiece[i].x-1]) || livePiece[i].y < 0)) {
				livePiece[i].x--;
			}
			else {
				moveAllowed = false;
			}
		}
	}

	if (direction === 'right') {
		// move each point in livePiece right
		for (let i = 0; i < 4; i++) {
			if (livePiece[i].x !== 9 && ((livePiece[i].y >= 0 && !gameBoard[livePiece[i].y][livePiece[i].x+1]) || livePiece[i].y < 0)) {
				livePiece[i].x++;
			}
			else {
				moveAllowed = false;
			}
		}
	}

	if (direction === 'up') {
		// move each point in livePiece right
		for (let i = 0; i < 4; i++) {
			if (!gameBoard[livePiece[i].y-1][livePiece[i].x]) {
				livePiece[i].y--;
			}
			else {
				moveAllowed = false;
			}
		}
	}

	// if cant move dont
	if (!moveAllowed) {
		livePiece = tempPiece;
	}

}

function rotatePiece() {
	if (input.counter) {
		input.counter = false;

		// remove livePiece from board
		removePiece();

		if (livePiece[4] === 'cyan') {
			// copy livePiece
			let tempPiece = [];
			for (let i = 0; i < 4; i++) {
				tempPiece.push({x:livePiece[i].x,y:livePiece[i].y});
			}
			tempPiece.push(livePiece[4]);

			rotateCyan();

			// floor kick
			if (livePiece[3].y > 19 || gameBoard[livePiece[3].y][livePiece[3].x]) {
				
				let temp = livePiece[3].y;
				// try to move left
				translatePiece('up');
				// if not moved set to tempPiece
				if (livePiece[3].y === temp) {
					removePiece();
					livePiece = tempPiece;
				}
			}

			// wall kick
			if (livePiece[3].x > 9 || gameBoard[livePiece[3].y][livePiece[3].x]) {

				let temp = livePiece[3].x;
				// try to move left
				translatePiece('left');
				// if not moved set to tempPiece
				if (livePiece[3].x === temp) {
					removePiece();
					livePiece = tempPiece;
				}
			}
			if (livePiece[1].x < 0 || (livePiece[1].y >= 0 && gameBoard[livePiece[1].y][livePiece[1].x])) {
				let temp = livePiece[3].x;
				// try to move left
				translatePiece('right');
				// if not moved set to tempPiece
				if (livePiece[3].x === temp) {
					removePiece();
					livePiece = tempPiece;
				}
			}
			if (livePiece[0].x < 0 || (livePiece[0].y >= 0 && gameBoard[livePiece[0].y][livePiece[0].x])) {
				let temp = livePiece[3].x;
				// try to move left
				translatePiece('right');
				// if not moved set to tempPiece
				if (livePiece[3].x === temp) {
					removePiece();
					livePiece = tempPiece;
				}
			}
		}
		else if (livePiece[4] === 'blue') {
			// copy livePiece
			let tempPiece = [];
			for (let i = 0; i < 4; i++) {
				tempPiece.push({x:livePiece[i].x,y:livePiece[i].y});
			}
			tempPiece.push(livePiece[4]);

			for (let i = 0; i < 4; i++) {
				if (i !== 2) {
					// if to the right
					if (tempPiece[2].x+1 === tempPiece[i].x) {
						//move top
						livePiece[i].x--;
						livePiece[i].y--;
					}
					// if on top
					if (tempPiece[2].y-1 === tempPiece[i].y) {
						// move left
						livePiece[i].x--;
						livePiece[i].y++;
					}
					// if on left
					if (tempPiece[2].x-1 === tempPiece[i].x) {
						// move bottom
						livePiece[i].x++;
						livePiece[i].y++;
					}
					// if on bottom
					if (tempPiece[2].y+1 === tempPiece[i].y) {
						// move right
						livePiece[i].x++;
						livePiece[i].y--;
					}
				}
			}

			// floor kick
			if (livePiece[3].y > 19 || gameBoard[livePiece[3].y][livePiece[3].x] ||
				livePiece[0].y > 19 || gameBoard[livePiece[0].y][livePiece[0].x] ||
				livePiece[1].y > 19 || gameBoard[livePiece[1].y][livePiece[1].x]) {
				
				let temp = livePiece[3].y;
				// try to move left
				translatePiece('up');
				// if not moved set to tempPiece
				if (livePiece[3].y === temp) {
					removePiece();
					livePiece = tempPiece;
				}
			}

			// wall kick
			if (livePiece[3].x > 9 || gameBoard[livePiece[3].y][livePiece[3].x] ||
				livePiece[0].x > 9 || gameBoard[livePiece[0].y][livePiece[0].x] ||
				livePiece[1].x > 9 || gameBoard[livePiece[1].y][livePiece[1].x]) {

				let temp = livePiece[3].x;
				// try to move left
				translatePiece('left');
				// if not moved set to tempPiece
				if (livePiece[3].x === temp) {
					removePiece();
					livePiece = tempPiece;
				}
			}
			if (livePiece[1].x < 0 || gameBoard[livePiece[1].y][livePiece[1].x] ||
				livePiece[0].x < 0 || gameBoard[livePiece[0].y][livePiece[0].x] ||
				livePiece[3].x < 0 || gameBoard[livePiece[3].y][livePiece[3].x]) {

				let temp = livePiece[3].x;
				// try to move left
				translatePiece('right');
				// if not moved set to tempPiece
				if (livePiece[3].x === temp) {
					removePiece();
					livePiece = tempPiece;
				}
			}
		}
		else if (livePiece[4] === 'orange') {
			// copy livePiece
			let tempPiece = [];
			for (let i = 0; i < 4; i++) {
				tempPiece.push({x:livePiece[i].x,y:livePiece[i].y});
			}
			tempPiece.push(livePiece[4]);

			for (let i = 0; i < 4; i++) {
				if (i !== 1) {
					// if to the right
					if (tempPiece[1].x+1 === tempPiece[i].x) {
						//move top
						livePiece[i].x--;
						livePiece[i].y--;
					}
					// if on top
					if (tempPiece[1].y-1 === tempPiece[i].y) {
						// move left
						livePiece[i].x--;
						livePiece[i].y++;
					}
					// if on left
					if (tempPiece[1].x-1 === tempPiece[i].x) {
						// move bottom
						livePiece[i].x++;
						livePiece[i].y++;
					}
					// if on bottom
					if (tempPiece[1].y+1 === tempPiece[i].y) {
						// move right
						livePiece[i].x++;
						livePiece[i].y--;
					}
				}
			}
			
			// floor kick
			if (livePiece[3].y > 19 || gameBoard[livePiece[3].y][livePiece[3].x] ||
				livePiece[0].y > 19 || gameBoard[livePiece[0].y][livePiece[0].x] ||
				livePiece[1].y > 19 || gameBoard[livePiece[1].y][livePiece[1].x]) {
				
				let temp = livePiece[3].y;
				// try to move left
				translatePiece('up');
				// if not moved set to tempPiece
				if (livePiece[3].y === temp) {
					removePiece();
					livePiece = tempPiece;
				}
			}

			// wall kick
			if (livePiece[3].x > 9 || gameBoard[livePiece[3].y][livePiece[3].x] ||
				livePiece[0].x > 9 || gameBoard[livePiece[0].y][livePiece[0].x] ||
				livePiece[1].x > 9 || gameBoard[livePiece[1].y][livePiece[1].x]) {

				let temp = livePiece[3].x;
				// try to move left
				translatePiece('left');
				// if not moved set to tempPiece
				if (livePiece[3].x === temp) {
					removePiece();
					livePiece = tempPiece;
				}
			}
			if (livePiece[1].x < 0 || gameBoard[livePiece[1].y][livePiece[1].x] ||
				livePiece[0].x < 0 || gameBoard[livePiece[0].y][livePiece[0].x] ||
				livePiece[3].x < 0 || gameBoard[livePiece[3].y][livePiece[3].x]) {

				let temp = livePiece[3].x;
				// try to move left
				translatePiece('right');
				// if not moved set to tempPiece
				if (livePiece[3].x === temp) {
					removePiece();
					livePiece = tempPiece;
				}
			}
		}
		else if (livePiece[4] === 'yellow') {
		}
		else if (livePiece[4] === 'green') {
			// copy livePiece
			let tempPiece = [];
			for (let i = 0; i < 4; i++) {
				tempPiece.push({x:livePiece[i].x,y:livePiece[i].y});
			}
			tempPiece.push(livePiece[4]);

			rotateGreen();

			// floor kick
			if ((livePiece[3].y >= 0 && gameBoard[livePiece[3].y][livePiece[3].x]) ||
				(livePiece[0].y >= 0 && gameBoard[livePiece[0].y][livePiece[0].x]) ||
				(livePiece[1].y >= 0 && gameBoard[livePiece[1].y][livePiece[1].x])) {
				
				let temp = livePiece[3].y;
				// try to move left
				translatePiece('up');
				// if not moved set to tempPiece
				if (livePiece[3].y === temp) {
					removePiece();
					livePiece = tempPiece;
				}
			}

			// wall kick
			if (livePiece[0].x < 0 || gameBoard[livePiece[0].y][livePiece[0].x]) {

				let temp = livePiece[3].x;
				// try to move right
				translatePiece('right');
				// if not moved set to tempPiece
				if (livePiece[3].x === temp) {
					removePiece();
					livePiece = tempPiece;
				}
			}
		}
		else if (livePiece[4] === 'purple') {
			// copy livePiece
			let tempPiece = [];
			for (let i = 0; i < 4; i++) {
				tempPiece.push({x:livePiece[i].x,y:livePiece[i].y});
			}
			tempPiece.push(livePiece[4]);

			for (let i = 0; i < 4; i++) {
				if (i !== 1) {
					// if to the right
					if (tempPiece[1].x+1 === tempPiece[i].x) {
						//move top
						livePiece[i].x--;
						livePiece[i].y--;
					}
					// if on top
					if (tempPiece[1].y-1 === tempPiece[i].y) {
						// move left
						livePiece[i].x--;
						livePiece[i].y++;
					}
					// if on left
					if (tempPiece[1].x-1 === tempPiece[i].x) {
						// move bottom
						livePiece[i].x++;
						livePiece[i].y++;
					}
					// if on bottom
					if (tempPiece[1].y+1 === tempPiece[i].y) {
						// move right
						livePiece[i].x++;
						livePiece[i].y--;
					}
				}
			}

			// floor kick
			if (livePiece[3].y > 19 || gameBoard[livePiece[3].y][livePiece[3].x] ||
				livePiece[0].y > 19 || gameBoard[livePiece[0].y][livePiece[0].x] ||
				livePiece[2].y > 19 || gameBoard[livePiece[2].y][livePiece[2].x]) {
				
				let temp = livePiece[3].y;
				// try to move left
				translatePiece('up');
				// if not moved set to tempPiece
				if (livePiece[3].y === temp) {
					removePiece();
					livePiece = tempPiece;
				}
			}

			// wall kick
			if (livePiece[3].x > 9 || gameBoard[livePiece[3].y][livePiece[3].x] ||
				livePiece[0].x > 9 || gameBoard[livePiece[0].y][livePiece[0].x] ||
				livePiece[2].x > 9 || gameBoard[livePiece[2].y][livePiece[2].x]) {

				let temp = livePiece[3].x;
				// try to move left
				translatePiece('left');
				// if not moved set to tempPiece
				if (livePiece[3].x === temp) {
					removePiece();
					livePiece = tempPiece;
				}
			}
			if (livePiece[2].x < 0 || gameBoard[livePiece[2].y][livePiece[2].x] ||
				livePiece[0].x < 0 || gameBoard[livePiece[0].y][livePiece[0].x] ||
				livePiece[3].x < 0 || gameBoard[livePiece[3].y][livePiece[3].x]) {

				let temp = livePiece[3].x;
				// try to move left
				translatePiece('right');
				// if not moved set to tempPiece
				if (livePiece[3].x === temp) {
					removePiece();
					livePiece = tempPiece;
				}
			}
		}
		else if (livePiece[4] === 'red') {
			// copy livePiece
			let tempPiece = [];
			for (let i = 0; i < 4; i++) {
				tempPiece.push({x:livePiece[i].x,y:livePiece[i].y});
			}
			tempPiece.push(livePiece[4]);

			rotateRed();

			// floor kick
			if ((livePiece[3].y >= 0 && gameBoard[livePiece[3].y][livePiece[3].x]) ||
				(livePiece[0].y >= 0 && gameBoard[livePiece[0].y][livePiece[0].x]) ||
				(livePiece[2].y >= 0 && gameBoard[livePiece[2].y][livePiece[2].x])) {
				
				let temp = livePiece[3].y;
				// try to move left
				translatePiece('up');
				// if not moved set to tempPiece
				if (livePiece[3].y === temp) {
					removePiece();
					livePiece = tempPiece;
				}
			}

			// wall kick
			if (livePiece[0].x < 0 || gameBoard[livePiece[0].y][livePiece[0].x]) {

				let temp = livePiece[3].x;
				// try to move right
				translatePiece('right');
				// if not moved set to tempPiece
				if (livePiece[3].x === temp) {
					removePiece();
					livePiece = tempPiece;
				}
			}
		}

		// put livePiece on board
		placePiece();
	}

	// Clockwise Rotation
	if (input.clockwise) {
		input.clockwise = false;
		removePiece();

		if (livePiece[4] === 'cyan') {
			// copy livePiece
			let tempPiece = [];
			for (let i = 0; i < 4; i++) {
				tempPiece.push({x:livePiece[i].x,y:livePiece[i].y});
			}
			tempPiece.push(livePiece[4]);

			rotateCyan();

			// floor kick
			if (livePiece[3].y > 19 || gameBoard[livePiece[3].y][livePiece[3].x]) {
				
				let temp = livePiece[3].y;
				// try to move left
				translatePiece('up');
				// if not moved set to tempPiece
				if (livePiece[3].y === temp) {
					removePiece();
					livePiece = tempPiece;
				}
			}

			// wall kick
			if (livePiece[3].x > 9 || gameBoard[livePiece[3].y][livePiece[3].x]) {

				let temp = livePiece[3].x;
				// try to move left
				translatePiece('left');
				// if not moved set to tempPiece
				if (livePiece[3].x === temp) {
					removePiece();
					livePiece = tempPiece;
				}
			}
			if (livePiece[1].x < 0 || (livePiece[1].y >= 0 && gameBoard[livePiece[1].y][livePiece[1].x])) {
				let temp = livePiece[3].x;
				// try to move left
				translatePiece('right');
				// if not moved set to tempPiece
				if (livePiece[3].x === temp) {
					removePiece();
					livePiece = tempPiece;
				}
			}
			if (livePiece[0].x < 0 || (livePiece[0].y >= 0 && gameBoard[livePiece[0].y][livePiece[0].x])) {
				let temp = livePiece[3].x;
				// try to move left
				translatePiece('right');
				// if not moved set to tempPiece
				if (livePiece[3].x === temp) {
					removePiece();
					livePiece = tempPiece;
				}
			}
		}
		else if (livePiece[4] === 'blue') {
			// copy livePiece
			let tempPiece = [];
			for (let i = 0; i < 4; i++) {
				tempPiece.push({x:livePiece[i].x,y:livePiece[i].y});
			}
			tempPiece.push(livePiece[4]);

			for (let i = 0; i < 4; i++) {
				if (i !== 2) {
					// if to the right
					if (tempPiece[2].x+1 === tempPiece[i].x) {
						//move bottom
						livePiece[i].x--;
						livePiece[i].y++;
					}
					// if on top
					if (tempPiece[2].y-1 === tempPiece[i].y) {
						// move right
						livePiece[i].x++;
						livePiece[i].y++;
					}
					// if on left
					if (tempPiece[2].x-1 === tempPiece[i].x) {
						// move top
						livePiece[i].x++;
						livePiece[i].y--;
					}
					// if on bottom
					if (tempPiece[2].y+1 === tempPiece[i].y) {
						// move left
						livePiece[i].x--;
						livePiece[i].y--;
					}
				}
			}

			// floor kick
			if (livePiece[3].y > 19 || gameBoard[livePiece[3].y][livePiece[3].x] ||
				livePiece[0].y > 19 || gameBoard[livePiece[0].y][livePiece[0].x] ||
				livePiece[1].y > 19 || gameBoard[livePiece[1].y][livePiece[1].x]) {
				
				let temp = livePiece[3].y;
				// try to move left
				translatePiece('up');
				// if not moved set to tempPiece
				if (livePiece[3].y === temp) {
					removePiece();
					livePiece = tempPiece;
				}
			}

			// wall kick
			if (livePiece[3].x > 9 || gameBoard[livePiece[3].y][livePiece[3].x] ||
				livePiece[0].x > 9 || gameBoard[livePiece[0].y][livePiece[0].x] ||
				livePiece[1].x > 9 || gameBoard[livePiece[1].y][livePiece[1].x]) {

				let temp = livePiece[3].x;
				// try to move left
				translatePiece('left');
				// if not moved set to tempPiece
				if (livePiece[3].x === temp) {
					removePiece();
					livePiece = tempPiece;
				}
			}
			if (livePiece[1].x < 0 || gameBoard[livePiece[1].y][livePiece[1].x] ||
				livePiece[0].x < 0 || gameBoard[livePiece[0].y][livePiece[0].x] ||
				livePiece[3].x < 0 || gameBoard[livePiece[3].y][livePiece[3].x]) {

				let temp = livePiece[3].x;
				// try to move left
				translatePiece('right');
				// if not moved set to tempPiece
				if (livePiece[3].x === temp) {
					removePiece();
					livePiece = tempPiece;
				}
			}
		}
		else if (livePiece[4] === 'orange') {
			// copy livePiece
			let tempPiece = [];
			for (let i = 0; i < 4; i++) {
				tempPiece.push({x:livePiece[i].x,y:livePiece[i].y});
			}
			tempPiece.push(livePiece[4]);

			for (let i = 0; i < 4; i++) {
				if (i !== 1) {
					// if to the right
					if (tempPiece[1].x+1 === tempPiece[i].x) {
						//move bottom
						livePiece[i].x--;
						livePiece[i].y++;
					}
					// if on top
					if (tempPiece[1].y-1 === tempPiece[i].y) {
						// move right
						livePiece[i].x++;
						livePiece[i].y++;
					}
					// if on left
					if (tempPiece[1].x-1 === tempPiece[i].x) {
						// move top
						livePiece[i].x++;
						livePiece[i].y--;
					}
					// if on bottom
					if (tempPiece[1].y+1 === tempPiece[i].y) {
						// move left
						livePiece[i].x--;
						livePiece[i].y--;
					}
				}
			}
			// floor kick
			if (livePiece[3].y > 19 || gameBoard[livePiece[3].y][livePiece[3].x] ||
				livePiece[0].y > 19 || gameBoard[livePiece[0].y][livePiece[0].x] ||
				livePiece[1].y > 19 || gameBoard[livePiece[1].y][livePiece[1].x]) {
				
				let temp = livePiece[3].y;
				// try to move left
				translatePiece('up');
				// if not moved set to tempPiece
				if (livePiece[3].y === temp) {
					removePiece();
					livePiece = tempPiece;
				}
			}

			// wall kick
			if (livePiece[3].x > 9 || gameBoard[livePiece[3].y][livePiece[3].x] ||
				livePiece[0].x > 9 || gameBoard[livePiece[0].y][livePiece[0].x] ||
				livePiece[1].x > 9 || gameBoard[livePiece[1].y][livePiece[1].x]) {

				let temp = livePiece[3].x;
				// try to move left
				translatePiece('left');
				// if not moved set to tempPiece
				if (livePiece[3].x === temp) {
					removePiece();
					livePiece = tempPiece;
				}
			}
			if (livePiece[1].x < 0 || gameBoard[livePiece[1].y][livePiece[1].x] ||
				livePiece[0].x < 0 || gameBoard[livePiece[0].y][livePiece[0].x] ||
				livePiece[3].x < 0 || gameBoard[livePiece[3].y][livePiece[3].x]) {

				let temp = livePiece[3].x;
				// try to move left
				translatePiece('right');
				// if not moved set to tempPiece
				if (livePiece[3].x === temp) {
					removePiece();
					livePiece = tempPiece;
				}
			}
		}
		else if (livePiece[4] === 'yellow') {
		}
		else if (livePiece[4] === 'green') {
			// copy livePiece
			let tempPiece = [];
			for (let i = 0; i < 4; i++) {
				tempPiece.push({x:livePiece[i].x,y:livePiece[i].y});
			}
			tempPiece.push(livePiece[4]);

			rotateGreen();

			// floor kick
			if ((livePiece[3].y >= 0 && gameBoard[livePiece[3].y][livePiece[3].x]) ||
				(livePiece[0].y >= 0 && gameBoard[livePiece[0].y][livePiece[0].x]) ||
				(livePiece[1].y >= 0 && gameBoard[livePiece[1].y][livePiece[1].x])) {
				
				let temp = livePiece[3].y;
				// try to move left
				translatePiece('up');
				// if not moved set to tempPiece
				if (livePiece[3].y === temp) {
					removePiece();
					livePiece = tempPiece;
				}
			}

			// wall kick
			if (livePiece[0].x < 0 || gameBoard[livePiece[0].y][livePiece[0].x]) {

				let temp = livePiece[3].x;
				// try to move right
				translatePiece('right');
				// if not moved set to tempPiece
				if (livePiece[3].x === temp) {
					removePiece();
					livePiece = tempPiece;
				}
			}
		}
		else if (livePiece[4] === 'purple') {
			// copy livePiece
			let tempPiece = [];
			for (let i = 0; i < 4; i++) {
				tempPiece.push({x:livePiece[i].x,y:livePiece[i].y});
			}
			tempPiece.push(livePiece[4]);

			for (let i = 0; i < 4; i++) {
				if (i !== 1) {
					// if to the right
					if (tempPiece[1].x+1 === tempPiece[i].x) {
						//move bottom
						livePiece[i].x--;
						livePiece[i].y++;
					}
					// if on top
					if (tempPiece[1].y-1 === tempPiece[i].y) {
						// move right
						livePiece[i].x++;
						livePiece[i].y++;
					}
					// if on left
					if (tempPiece[1].x-1 === tempPiece[i].x) {
						// move top
						livePiece[i].x++;
						livePiece[i].y--;
					}
					// if on bottom
					if (tempPiece[1].y+1 === tempPiece[i].y) {
						// move left
						livePiece[i].x--;
						livePiece[i].y--;
					}
				}
			}

			// floor kick
			if (livePiece[3].y > 19 || gameBoard[livePiece[3].y][livePiece[3].x] ||
				livePiece[0].y > 19 || gameBoard[livePiece[0].y][livePiece[0].x] ||
				livePiece[2].y > 19 || gameBoard[livePiece[2].y][livePiece[2].x]) {
				
				let temp = livePiece[3].y;
				// try to move left
				translatePiece('up');
				// if not moved set to tempPiece
				if (livePiece[3].y === temp) {
					removePiece();
					livePiece = tempPiece;
				}
			}

			// wall kick
			if (livePiece[3].x > 9 || gameBoard[livePiece[3].y][livePiece[3].x] ||
				livePiece[0].x > 9 || gameBoard[livePiece[0].y][livePiece[0].x] ||
				livePiece[2].x > 9 || gameBoard[livePiece[2].y][livePiece[2].x]) {

				let temp = livePiece[3].x;
				// try to move left
				translatePiece('left');
				// if not moved set to tempPiece
				if (livePiece[3].x === temp) {
					removePiece();
					livePiece = tempPiece;
				}
			}
			if (livePiece[2].x < 0 || gameBoard[livePiece[2].y][livePiece[2].x] ||
				livePiece[0].x < 0 || gameBoard[livePiece[0].y][livePiece[0].x] ||
				livePiece[3].x < 0 || gameBoard[livePiece[3].y][livePiece[3].x]) {

				let temp = livePiece[3].x;
				// try to move left
				translatePiece('right');
				// if not moved set to tempPiece
				if (livePiece[3].x === temp) {
					removePiece();
					livePiece = tempPiece;
				}
			}
		}
		else if (livePiece[4] === 'red') {
			// copy livePiece
			let tempPiece = [];
			for (let i = 0; i < 4; i++) {
				tempPiece.push({x:livePiece[i].x,y:livePiece[i].y});
			}
			tempPiece.push(livePiece[4]);

			rotateRed();

			// floor kick
			if ((livePiece[3].y >= 0 && gameBoard[livePiece[3].y][livePiece[3].x]) ||
				(livePiece[0].y >= 0 && gameBoard[livePiece[0].y][livePiece[0].x]) ||
				(livePiece[2].y >= 0 && gameBoard[livePiece[2].y][livePiece[2].x])) {
				
				let temp = livePiece[3].y;
				// try to move left
				translatePiece('up');
				// if not moved set to tempPiece
				if (livePiece[3].y === temp) {
					removePiece();
					livePiece = tempPiece;
				}
			}

			// wall kick
			if (livePiece[0].x < 0 || gameBoard[livePiece[0].y][livePiece[0].x]) {

				let temp = livePiece[3].x;
				// try to move right
				translatePiece('right');
				// if not moved set to tempPiece
				if (livePiece[3].x === temp) {
					removePiece();
					livePiece = tempPiece;
				}
			}
		}

		placePiece();
	}
}

function rotateCyan() {
	if (livePiece[2].y === livePiece[3].y) {

		livePiece[0].x += 2;
		livePiece[0].y -= 2;

		livePiece[1].x++;
		livePiece[1].y--;

		livePiece[3].x--;
		livePiece[3].y++;
	}
	else {

		livePiece[0].x -= 2;
		livePiece[0].y += 2;

		livePiece[1].x--;
		livePiece[1].y++;

		livePiece[3].x++;
		livePiece[3].y--;
	}
}

function rotateGreen() {
	// copy livePiece
	let tempPiece = [];
	for (let i = 0; i < 4; i++) {
		tempPiece.push({x:livePiece[i].x,y:livePiece[i].y});
	}
	tempPiece.push(livePiece[4]);

	// if horizontal
	if (tempPiece[2].y+1 === tempPiece[1].y) {
		livePiece[1].x++;
		livePiece[1].y--;
		livePiece[0].x+=2;
		livePiece[3].x--;
		livePiece[3].y--;
	}
	// if vertical
	else {
		livePiece[1].x--;
		livePiece[1].y++;
		livePiece[0].x-=2;
		livePiece[3].x++;
		livePiece[3].y++;
	}
}

function rotateRed() {
	// copy livePiece
	let tempPiece = [];
	for (let i = 0; i < 4; i++) {
		tempPiece.push({x:livePiece[i].x,y:livePiece[i].y});
	}
	tempPiece.push(livePiece[4]);

	// if horizontal
	if (tempPiece[1].y+1 === tempPiece[2].y) {
		livePiece[0].x++;
		livePiece[0].y++;
		livePiece[2].x++;
		livePiece[2].y--;
		livePiece[3].y--;
		livePiece[3].y--;
	}
	// if vertical
	else {
		livePiece[0].x--;
		livePiece[0].y--;
		livePiece[2].x--;
		livePiece[2].y++;
		livePiece[3].y++;
		livePiece[3].y++;
	}
}

function checkLines() {
	let lines = [];
	let drop = false;
	for (let i = gameBoard.length-1; i >= 0; i--) {
		let line = 0;
		for (let j = 0; j < gameBoard[i].length; j++) {
			if (gameBoard[i][j]) {
				if (!drop) {
					line++;
				}
				else {
					// drop block
					gameBoard[i+lines.length][j] = gameBoard[i][j];
					gameBoard[i][j] = null;
				}
			}
		}
		if (line === 10) {
			lines.push(i);
		}
		else if (!drop) {
			line = 0;
			if (lines.length > 0) {
				// add to score
				if (lines.length === 1) {
					score += 40 * (level+1);
				}
				else if (lines.length === 2) {
					score += 100 * (level+1);
				}
				else if (lines.length === 3) {
					score += 300 * (level+1);
				}
				else if (lines.length === 4) {
					score += 1200 * (level+1);
				}

				// remove lines from board
				for (let j = 0; j < lines.length; j++) {
					for (let k = 0; k < 10; k++) {
						gameBoard[lines[j]][k] = null;
					}
					linesCleared++;
					tempLinesCleared++;
				}
				clear.play();

				// drop all blocks above lines
				drop = true;
				i++;
				//i=19;
			}
		}
	}
}

function autoDrop() {
	dropTimer = 0;

	let tempPiece = [];
	for (let i = 0; i < 4; i++) {
		tempPiece.push({x:livePiece[i].x,y:livePiece[i].y});
	}
	tempPiece.push(livePiece[4]);

	let moveAllowed = true;

	// remove livePiece from board
	removePiece();

	// move each point in livePiece down
	for (let i = 0; i < 4; i++) {
		if (livePiece[i].y === 19 || (livePiece[i].y > 0 && gameBoard[livePiece[i].y+1][livePiece[i].x])) {
			moveAllowed = false;
		}
	}

	// if cant move dont
	if (moveAllowed) {
		livePiece[0].y++;
		livePiece[1].y++;
		livePiece[2].y++;
		livePiece[3].y++;
	}
	else {
		livePiece = tempPiece;
	}

	// put livePiece on board
	placePiece();

	// lock piece
	if (!moveAllowed) {
		livePiece = [];
		input.softDrop = false;
		checkLines();
		lock.play();
	}
}

function highScore(score) {
	// persist top 5 high scores to browser
	let board;
	let recorded = false;
	if (localStorage.score) {
		board = JSON.parse(localStorage.score);
	}
	else {
		board = [];
	}

	if (board.length === 0) {
		board.push(score);
	}
	else {
		for (let i = 0; i < board.length; i++) {
			if (score > board[i] && !recorded) {
				board.splice(i, 0, score);
				recorded = true;
			}
		}
		if (!recorded) {
			board.push(score);
		}
		if (board.length === 6) {
			board.pop();
		}
	}
	localStorage.score = JSON.stringify(board);
}
