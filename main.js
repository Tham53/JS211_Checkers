//1. Create overall function for setup, board and score
(function () {
	var app = {},
		settings = {
			scope: 'game-stage',
			board: 'board',
			score: {
				element: 'score',
				checkerRed: 'score__checker-red' ,
				checkerBlue: 'score__checker-blue' 
			},
			checker: {
				red: {
					name: 'Checker Red'
				},
				blue: {
					name: 'Checker Blue'
				}
			}
		};

	app.init = function () {
		app.setup();
		app.build();
		app.attach();
		app.updateScore();
		app.bind();
	};

	app.setup = function () {
		app.scope = document.getElementById(settings.scope),
		app.board = app.scope.getElementsByClassName(settings.board)[0];
	};

//2. Board and checker pieces
	app.build = function () {
		var html = [];
		for (var y = 0; y < 8; y++) {
			html.push('<div class="row">');
			for (var x = 0; x < 8; x++) {
				var squareType = ((y + x) % 2) ? 'black' : 'white';
				html.push('<span class="board__square ' + squareType + '" data-position="' + y + '-' + x + '">');
				if (squareType === 'black' && y > 4) {
					html.push('<span class="board__piece checker-red" data-piece-type="checker-red"></span>');
				}
				if (squareType === 'black' && y < 3) {
					html.push('<span class="board__piece checker-blue" data-piece-type="checker-blue"></span>');
				}
				html.push('</span>');
			}
			html.push('</div>');
		}
		app.board.innerHTML = html.join('');
	};

	app.attach = function () {
		app.squares = document.getElementsByClassName('board__square black');
		app.score = app.scope.getElementsByClassName(settings.score.element)[0];
		app.selectedPiece = null;
		app.selectedSquare = null;
		app.selectedDestiny = null;
		app.possibilities = [];
		app.checker = {
			red: { score: 0 },
			blue: { score: 0 }
		};
		app.isCheckerRed = true;
	};

//4. Event listeners
	app.bind = function () {
		for (var i = 0, len = app.squares.length; i < len; i++) {
			app.squares[i].addEventListener('click', function () {
				app.move(this);
			}, false);
		}
	};


//5. Setup the process of current match.
	app.move = function (target) {
		if (app.selectedPiece == null) {
			app.choosePiece(target);
			app.originPosition = app.getPosition(target);
		}
		else {
			if (!app.getPiece(target)) {
				app.selectedDestiny = target;
				app.destinyPosition = app.getPosition(target);

				app.jump();
				app.resetVars();

				// app.checkMove();
				// app.setMatchPosition();
			}
			else {
				app.resetVars();
			}
		}
	};

// select piece to match
	app.choosePiece = function (square) {
		var pieceType = null,
			piece = app.getPiece(square);
		if (piece) {
			app.selectedPiece = piece;
			pieceType = app.getPieceType(piece);

			if (app.isValidPiece(pieceType)) {
				app.selectedSquare = square;
				app.selectedPiece.classList.add('selected');
			}
			else {
				return false;
			}
		}
	};


	//Check if there is piece in the square.
	app.getPiece = function (square) {
		return square.getElementsByClassName('board__piece')[0] || false;	
	};

	app.isValidPiece = function (pieceType, isToCapture) {
		var captureFlag = isToCapture || false;

		if (captureFlag) {
			return ((app.isCheckerRed && pieceType === 'checker-blue') || (!app.isCheckerRed && pieceType === 'checker-red')) ? true : false;
		}
		else {
			return ((app.isCheckerRed && pieceType === 'checker-red') || (!app.isCheckerRed && pieceType === 'checker-blue')) ? true : false;
		}
	};


	//Check if selected piece is king.
	app.isKing = function (piece) {
		return piece.classList.contains('king');
	};



	//Set piece like king.
	app.setKing = function (piece) {
		piece.classList.add('king');
	};


	app.setupPosibilities = function () {
		var position = app.getPosition(app.selectedDestiny);

		if (app.isKing(app.selectedPiece)) {
			app.possibilities = [
				{ y: (position.y - 1) , x: (position.x + 1) },
				{ y: (position.y - 1) , x: (position.x - 1) },
				{ y: (position.y + 1) , x: (position.x + 1) },
				{ y: (position.y + 1) , x: (position.x - 1) }
			];

			app.destines = [
				{ y: (position.y - 2) , x: (position.x + 2) },
				{ y: (position.y - 2) , x: (position.x - 2) },
				{ y: (position.y + 2) , x: (position.x + 2) },
				{ y: (position.y + 2) , x: (position.x - 2) }
			];
		}
		else {
			if (app.isCheckerRed) {
				app.possibilities = [
					{ y: (position.y - 1), x: (position.x + 1) },
					{ y: (position.y - 1), x: (position.x - 1) }
				];
			}
			else {
				app.possibilities = [
					{ y: (position.y + 1), x: (position.x + 1) },
					{ y: (position.y + 1), x: (position.x - 1) }
				];
			}
		}
	};

	// Reset variables.
	app.resetVars = function () {
		app.selectedPiece.classList.remove('selected');
		app.selectedPiece = null;
		app.selectedSquare = null;
		app.selectedDestiny = null;
		app.possibilities = [];
	};

	app.isValidMovement = function (origin, destiny) {
		return ((app.isCheckerRed && destiny.y < origin.y) || (!app.isCheckerRed && destiny.y > origin.y)) ? true : false;
	};

	//Move piece. If captured, remove.
	app.movePiece = function (captured) {
		var destinyPos = app.getPosition(app.selectedDestiny);
		app.selectedDestiny.appendChild(app.selectedPiece);
		if (captured) {
			captured.remove();
		}

		if (!app.isKing(app.selectedPiece) && destinyPos.y === 0 || destinyPos.y === 7) {
			app.setKing(app.selectedPiece);
		}
	};

	app.getElementSquare = function (posY, posX) {
		var position = posY + '-' + posX;
		return app.board.querySelectorAll('[data-position="' + position + '"]')[0] || false;
	};

	//Get the captured piece.
	app.getCaptured = function () {
		var pos = { x: null, y: null };
		pos.y = (app.originPosition.y > app.destinyPosition.y) ? app.destinyPosition.y + 1 : app.destinyPosition.y - 1;
		pos.x = (app.originPosition.x > app.destinyPosition.x) ? app.destinyPosition.x + 1 : app.destinyPosition.x - 1;
		return app.getPiece(app.getElementSquare(pos.y, pos.x));
	};

	//Change the player's turn.
	app.changeChecker = function () {
		app.isCheckerRed = !app.isCheckerRed;
	};

	app.jump = function () {
		var squarePos = app.getPosition(app.selectedSquare),
			destinyPos = app.getPosition(app.selectedDestiny),
			diff = {
				y: Math.abs(squarePos.y - destinyPos.y),
				x: Math.abs(squarePos.x - destinyPos.x)
			};

		if (app.isKing(app.selectedPiece) || app.isValidMovement(squarePos, destinyPos)) {
			if (diff.x === 1 && diff.y === 1) {
				app.movePiece();
				app.changeChecker();
			}
			else {
				if (diff.x === 2 && diff.y === 2) {
					var capturedPiece = app.getCaptured();
					if (capturedPiece && !app.isValidPiece(app.getPieceType(capturedPiece))) {
						app.movePiece(capturedPiece);
						app.updateScore();
						app.setupPosibilities();
						app.verifyNewCapture();
					}
					}
			}
		}
	};

	//Get the square's position in the board.
	app.getPosition = function (element) {
		var dataPos = element.getAttribute('data-position').split('-');
		return {
			y: parseInt(dataPos[0]),
			x: parseInt(dataPos[1])
		};
	};

	//Get the piece's type.
	app.getPieceType = function (element) {
		return element.getAttribute('data-piece-type');
	};

	app.showMessage = function (message) {
		console.log('### ', message);
	};

	//Check if there is piece to be captured.
	app.verifyNewCapture = function () {
		var nextElement = null,
			nextDestiny = null,
			nextPiece = null,
			pos = { x: null, y: null };
		for (var i = 0, len = app.possibilities.length; i < len; i++) {
			nextElement = app.getElementSquare(app.possibilities[i].y, app.possibilities[i].x);
			if (app.isKing(app.selectedPiece)) {
				nextDestiny = app.getElementSquare(app.destines[i].y, app.destines[i].x);
			}
			else {
				pos.y = (app.isCheckerRed) ? app.possibilities[i].y - 1 : app.possibilities[i].y + 1;
				pos.x = (i % 2 === 0) ? app.possibilities[i].x + 1 : app.possibilities[i].x - 1;
				nextDestiny = app.getElementSquare(pos.y, pos.x);
			}

			if (nextElement) {
				nextPiece = app.getPiece(nextElement);
			}

			if (nextPiece && nextDestiny && !app.getPiece(nextDestiny) && app.isValidPiece(app.getPieceType(nextPiece), true)) {
				console.log('Cant capture.');
				break;
			}
			else {
				if (i === len - 1) {
					app.changeChecker();
				}
			}
		}
	};

	//score.
	app.updateScore = function () {
		if (app.isCheckerRed) {
			app.checker.red.score++;
		}
		else {
			app.checker.blue.score++;	
		}
		app.checkWinner();
	};

	app.checkWinner = function () {
		if (app.checker.red.score === 12) {
			alert('Red Wins');
		}
		if (app.checker.blue.score === 12) {
			alert('Blue Wins');
		}
	};
	app.init();
})();