var socket = io();
var username = null;
var gameId = null;
var myTurn = false;
var board = ['','','','','','','','',''];

var canvasToClean = [];

var connectionId = document.getElementById('connectionId');
var copyToClipboardBtn = document.getElementById('copy-to-clipboard-btn');
var connectionArea = document.getElementById('connection-area');
var boardArea = document.getElementById('board-area');
var resultsArea = document.getElementById('results-area');

var winsArea = document.getElementById('wins-area');
var winsCounterLabel = document.getElementById('wins-counter-label');
var losesCounterLabel = document.getElementById('loses-counter-label');

var turnsArea = document.getElementById('turns-area');
var turnLbl = document.getElementById('turn-label');
var turnSpinner = document.getElementById('turn-spinner');

var opponentPlayAgainLbl = document.getElementById('opponent-play-again-label');
var replayBtn = document.getElementById('replay-btn');
var leaveBtn = document.getElementById('leave-btn');

var cell1 = document.getElementById('cell-1');
var cell2 = document.getElementById('cell-2');
var cell3 = document.getElementById('cell-3');
var cell4 = document.getElementById('cell-4');
var cell5 = document.getElementById('cell-5');
var cell6 = document.getElementById('cell-6');
var cell7 = document.getElementById('cell-7');
var cell8 = document.getElementById('cell-8');
var cell9 = document.getElementById('cell-9');

var cells = [cell1, cell2, cell3, cell4, cell5, cell6, cell7, cell8, cell9];

cell1.addEventListener('click', function(event) {
    socket.emit('played', gameId, 0);
});
cell2.addEventListener('click', function(event) {
    socket.emit('played', gameId, 1);
});
cell3.addEventListener('click', function(event) {
    socket.emit('played', gameId, 2);
});
cell4.addEventListener('click', function(event) {
    socket.emit('played', gameId, 3);
});
cell5.addEventListener('click', function(event) {
    socket.emit('played', gameId, 4);
});
cell6.addEventListener('click', function(event) {
    socket.emit('played', gameId, 5);
});
cell7.addEventListener('click', function(event) {
    socket.emit('played', gameId, 6);
});
cell8.addEventListener('click', function(event) {
    socket.emit('played', gameId, 7);
});
cell9.addEventListener('click', function(event) {
    socket.emit('played', gameId, 8);
});

var joinEvt = function () {
    socket.emit('connect-to', document.getElementById('opponentId-input').value);
};

copyToClipboardBtn.addEventListener('click', function copyToClipboard() {
    // create hidden text element, if it doesn't already exist
    var targetId = "_hiddenCopyText_";

    // must use a temporary form element for the selection and copy
    target = document.getElementById(targetId);
    if (!target) {
        var target = document.createElement("textarea");
        target.style.position = "absolute";
        target.style.left = "-9999px";
        target.style.top = "0";
        target.id = targetId;
        document.body.appendChild(target);
    }
    target.textContent = connectionId.textContent;

    // select the content
    var currentFocus = document.activeElement;
    target.focus();
    target.setSelectionRange(0, target.value.length);

    // copy the selection
    var succeed;
    try {
        succeed = document.execCommand("copy");
        alert('ID copied to clipboard');
    } catch(e) {
        succeed = false;
    }
    // restore original focus
    if (currentFocus && typeof currentFocus.focus === "function") {
        currentFocus.focus();
    }

    // clear temporary content
    target.textContent = "";

    return succeed;
});

document.getElementById('join').addEventListener('click', joinEvt);
document.addEventListener('keydown', function (evt) {
    if (evt.which === 13) {
        joinEvt();
    }
});

socket.emit('new-player', username, function(confirmation){
    connectionId.innerText = socket.id;
});

socket.on('game-on', function(newGameId, newMyTurn) {
    hideResultsArea();
    resetBoard();
    clearCells();

    console.log(newMyTurn)

    gameId = newGameId;
    myTurn = newMyTurn;

    startGame();
});

socket.on('turn', function(newBoard, changedCell, newMyTurn) {
    board = newBoard;
    myTurn = newMyTurn;

    var canvasInsideCell = cells[changedCell].children[0];

    canvasToClean.push(canvasInsideCell);

    if(board[changedCell] === socket.id) {
        canvasInsideCell.innerHTML = 'X';
        createCross(canvasInsideCell);
    } else {
        canvasInsideCell.innerHTML = 'O';
        createCircle(canvasInsideCell);
    }

    if(myTurn) {
        turnLbl.innerHTML = "Your turn!";
        turnSpinner.style.display = 'none';
    } else {
        turnLbl.innerHTML = "Waiting for your opponent";
        turnSpinner.style.display = 'block';
    }
});

socket.on('game-over', function(winner, ownWins, opponentWins) {
    resultsArea.style.display = 'block';
    turnsArea.style.display = 'none';

    winsCounterLabel.innerHTML = ownWins;
    losesCounterLabel.innerHTML = opponentWins;
    if (winner === socket.id) {
        document.getElementById('result').innerText = 'You won!';
    } else {
        document.getElementById('result').innerText = 'You lost...';
    }
});

socket.on('opponent-play-again', function() {
    opponentPlayAgainLbl.style.display = 'block';
});

socket.on('opponent-leave', function() {
    alert("Your opponent left.");

    goBackToHomePage();

    for(let c of canvasToClean) {
        c.getContext('2d').clearRect(0, 0, c.width, c.height);
    }
});

replayBtn.addEventListener('click', function () {
    socket.emit('play-again', gameId, socket.id);
    replayBtn.style.display = 'none';
});

leaveBtn.addEventListener('click', function () {
    clearCells();

    goBackToHomePage();

    socket.emit('leave-game', gameId, socket.id);
});

function goBackToHomePage() {
    hideResultsArea();
    winsCounterLabel.innerHTML = '0';
    losesCounterLabel.innerHTML = '0';
    boardArea.style.display = 'none';
    connectionArea.style.display = 'block';
    turnsArea.style.display = 'block';
}

function hideResultsArea() {
    resultsArea.style.display = 'none';
    opponentPlayAgainLbl.style.display = 'none';
    replayBtn.style.display = 'block';
    leaveBtn.style.display = 'block';
}

function resetBoard() {
    board = ['','','','','','','','',''];
}

function clearCells() {
    for(let c of canvasToClean) {
        c.getContext('2d').clearRect(0, 0, c.width, c.height);
    }
}

function createCircle(canvas) {
    var context = canvas.getContext('2d');
    var radius = context.canvas.width/2 * 0.9;
    var endPercent = 101;
    var curPerc = 0;
    var counterClockwise = false;
    var circ = Math.PI * 2;
    var quart = Math.PI / 2;

    context.lineWidth = 10;
    context.strokeStyle = '#ffffff';
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;


    function animate(current) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.beginPath();
        context.arc(context.canvas.width/2, context.canvas.height/2, radius, -(quart), ((circ) * current) - quart, false);
        context.stroke();
        curPerc+=2;

        if (curPerc < endPercent) {
            requestAnimationFrame(function () {
                animate(curPerc / 100)
            });
        }
    }

    animate();
}

function createCross(canvas) {

    var context = canvas.getContext('2d');
    var x = context.canvas.width/2 * 0.1;
    var y = context.canvas.width/2 * 0.1;
    var maxCoord = context.canvas.width * 0.9;
    var endPercent = 101;
    var curPerc = 0;

    context.lineWidth = 10;
    context.strokeStyle = '#ffffff';
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;


    function animate1(current) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.beginPath();

        context.moveTo(x, y);
        context.lineTo(x + maxCoord * current, y + maxCoord * current);
        context.stroke();

        curPerc+=4;

        if (curPerc < endPercent) {
            requestAnimationFrame(function () {
                animate1(curPerc / 100)
            });
        } else {
            curPerc = 0;
            animate2();
        }
    }
    function animate2(current) {
        //context.clearRect(0, 0, canvas.width, canvas.height);
        context.beginPath();

        context.moveTo(maxCoord + x, y);
        context.lineTo(maxCoord - maxCoord * current + x, y + maxCoord * current);
        context.stroke();
        curPerc+=4;

        if (curPerc < endPercent) {
            requestAnimationFrame(function () {
                animate2(curPerc / 100)
            });
        }
    }

    animate1();
}

function startGame() {
    turnsArea.style.display = 'block';

    if(myTurn) {
        turnLbl.innerHTML = "Your turn!";
        turnSpinner.style.display = 'none';
    } else {
        turnLbl.innerHTML = "Waiting for your opponent";
        turnSpinner.style.display = 'block';
    }

    connectionArea.style.display = 'none';
    boardArea.style.display = 'block';
}
